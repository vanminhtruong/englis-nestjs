<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-all">
    <div class="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between gap-8">
      <AppHeaderLogo />
      <AppHeaderDesktopNav />
      <AppHeaderActions
        :is-dark="isDark"
        :is-authenticated="authStore.isAuthenticated"
        :is-user-menu-open="isUserMenuOpen"
        :is-mobile-menu-open="isMobileMenuOpen"
        :user-avatar-src="userAvatarSrc"
        :user-initials="userInitials"
        :user-words-count="authStore.user?.totalWords || 0"
        @toggle-theme="toggleTheme"
        @toggle-user-menu="toggleUserMenu"
        @close-user-menu="closeUserMenu"
        @logout="handleLogout"
        @toggle-mobile-menu="toggleMobileMenu"
        @toggle-mobile-account-menu="toggleMobileAccountMenu"
      />
    </div>

    <!-- Scroll Progress Bar -->
    <div class="w-full h-0.5 bg-transparent">
      <div
        class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-[width] duration-150 ease-out"
        :style="{ width: scrollProgress + '%' }"
      />
    </div>

    <!-- Mobile Menu -->
    <AppHeaderMobileMenu
      :is-open="isMobileMenuOpen"
      :is-authenticated="authStore.isAuthenticated"
      :is-mobile-vocab-menu-open="isMobileVocabMenuOpen"
      @close-menu="closeMobileMenu"
      @close-menus="closeMobileMenus"
      @toggle-vocab-menu="toggleMobileVocabMenu"
      @logout="handleLogout"
    />
    <AppHeaderMobileAccountMenu
      :is-open="isMobileAccountMenuOpen"
      :user-avatar-src="userAvatarSrc"
      @close-menu="closeMobileAccountMenu"
      @logout="handleLogout"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth.store'
import { websocketService } from '../../services/websocket.service'
import apiService from '../../services/api.service'

const AppHeaderLogo = defineAsyncComponent(() => import('./app-header/AppHeaderLogo.vue') as any)
const AppHeaderDesktopNav = defineAsyncComponent(() => import('./app-header/AppHeaderDesktopNav.vue') as any)
const AppHeaderActions = defineAsyncComponent(() => import('./app-header/AppHeaderActions.vue') as any)
const AppHeaderMobileMenu = defineAsyncComponent(() => import('./app-header/AppHeaderMobileMenu.vue') as any)
const AppHeaderMobileAccountMenu = defineAsyncComponent(() => import('./app-header/AppHeaderMobileAccountMenu.vue') as any)
const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()
const isDark = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileAccountMenuOpen = ref(false)
const isMobileVocabMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const userAvatarSrc = computed(() => {
  const user = authStore.user
  if (user && user.avatar) {
    return user.avatar
  }
  const seed = user?.fullName || 'User'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
})

const userInitials = computed(() => {
  const fullName = authStore.user?.fullName?.trim()
  if (!fullName) return ''
  const parts = fullName.split(/\s+/)
  const initials = parts.map((part) => part[0]).join('').toUpperCase()
  return initials
})

const scrollProgress = ref(0)

function updateScrollProgress() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
  scrollProgress.value = Math.min(100, Math.max(0, progress))
}

onMounted(() => {
  updateScrollProgress()
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
})

onMounted(async () => {
  // Load user profile first to get theme
  if (authStore.isAuthenticated) {
    try {
      // Load user profile if not already loaded
      if (!authStore.user) {
        console.log('Loading user profile...')
        const response = await apiService.auth.getProfile()
        console.log('Profile loaded:', response.data)
        authStore.updateUser(response.data)
      }
      
      // Fix totalWords if it's 0 by recalculating
      if (authStore.user?.totalWords === 0) {
        console.log('Recalculating totalWords...')
        try {
          const recalcResponse = await apiService.auth.recalculateWords()
          console.log('Total words recalculated:', recalcResponse.data)
          // Update the user store with the correct totalWords
          if (authStore.user) {
            authStore.user.totalWords = recalcResponse.data.totalWords
          }
        } catch (recalcError) {
          console.error('Failed to recalculate totalWords:', recalcError)
        }
      }
      
      // Apply theme from user profile
      const theme = authStore.user?.theme || 'light'
      console.log('Applying theme:', theme, 'from user:', authStore.user)
      isDark.value = theme === 'dark'
      applyTheme(theme)
      
      websocketService.connect()
  
  // Listen for theme changes from other devices
  websocketService.on('user:theme:changed', (data: any) => {
    if (data.userId === authStore.user?.id) {
      const theme = data.theme
      isDark.value = theme === 'dark'
      applyTheme(theme)
    }
  })

  // Listen for profile changes from other devices/tabs
  websocketService.on('user:profile:updated', (data: any) => {
    if (data.userId === authStore.user?.id) {
      const profile = data.profile
      authStore.updateUser(profile)

      if (profile.theme) {
        const theme = profile.theme
        isDark.value = theme === 'dark'
        applyTheme(theme)
      }
    }
  })

  websocketService.on('user:layout:changed', (data: any) => {
    if (data.userId === authStore.user?.id) {
      authStore.updateUser({ vocabularyLayout: data.layout })
    }
  })
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Fallback to local storage
      isDark.value = document.documentElement.classList.contains('dark')
    }
  } else {
    // Fallback to local storage
    isDark.value = document.documentElement.classList.contains('dark')
  }
})

function applyTheme(theme: string) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  try {
    localStorage.setItem('theme', theme)
  } catch (e) {
    // Ignore storage errors
  }
}

const toggleTheme = async () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  applyTheme(theme)
  
  // Save to backend for real-time sync across devices
  if (authStore.isAuthenticated) {
    try {
      await apiService.auth.updateTheme(theme)
      // Update local store
      if (authStore.user) {
        authStore.user.theme = theme
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isMobileAccountMenuOpen.value = false
    isMobileVocabMenuOpen.value = false
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isMobileVocabMenuOpen.value = false
}

const toggleMobileAccountMenu = () => {
  isMobileAccountMenuOpen.value = !isMobileAccountMenuOpen.value
  if (isMobileAccountMenuOpen.value) {
    isMobileMenuOpen.value = false
    isMobileVocabMenuOpen.value = false
  }
}

const closeMobileAccountMenu = () => {
  isMobileAccountMenuOpen.value = false
}

const toggleMobileVocabMenu = () => {
  isMobileVocabMenuOpen.value = !isMobileVocabMenuOpen.value
}

const closeMobileMenus = () => {
  closeMobileMenu()
  closeMobileAccountMenu()
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = () => {
  authStore.clearAuth()
  websocketService.disconnect()
  router.push('/')
  closeMobileMenu()
  closeUserMenu()
  closeMobileAccountMenu()
}
</script>

<script lang="ts">
export default {
  name: 'AppHeader'
}
</script>
