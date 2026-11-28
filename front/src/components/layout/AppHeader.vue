<template>
  <header
    class="sticky top-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-all"
  >
    <div
      class="seasonal-header-inner mx-auto flex w-full max-w-[1400px] min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8"
    >
      <AppHeaderLogo />
      <AppHeaderDesktopNav />
      <AppHeaderActions
        :is-dark="isDark"
        :is-authenticated="authStore.isAuthenticated"
        :is-user-menu-open="isUserMenuOpen"
        :is-language-menu-open="isLanguageMenuOpen"
        @update-language-menu="setLanguageMenu"
        :is-mobile-menu-open="isMobileMenuOpen"
        :is-mobile-account-menu-open="isMobileAccountMenuOpen"
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
    <div class="w-full h-0.5 bg-transparent" style="contain: layout paint">
      <div
        class="seasonal-progress h-full bg-gradient-to-r from-primary-500 to-secondary-500"
        ref="progressBar"
        aria-hidden="true"
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
import { resolveAssetUrl } from "@/utils/assetUrl";
import { ref, onMounted, onBeforeUnmount, defineAsyncComponent, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.store";
import { websocketService } from "../../services/websocket.service";
import apiService from "../../services/api.service";
import { useToast } from "../../composables/useToast";

const AppHeaderLogo = defineAsyncComponent(() => import("./app-header/AppHeaderLogo.vue") as any);
const AppHeaderDesktopNav = defineAsyncComponent(
  () => import("./app-header/AppHeaderDesktopNav.vue") as any,
);
const AppHeaderActions = defineAsyncComponent(
  () => import("./app-header/AppHeaderActions.vue") as any,
);
const AppHeaderMobileMenu = defineAsyncComponent(
  () => import("./app-header/AppHeaderMobileMenu.vue") as any,
);
const AppHeaderMobileAccountMenu = defineAsyncComponent(
  () => import("./app-header/AppHeaderMobileAccountMenu.vue") as any,
);
const { t } = useI18n();

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const isDark = ref(false);
const isMobileMenuOpen = ref(false);
const isMobileAccountMenuOpen = ref(false);
const isMobileVocabMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const isLanguageMenuOpen = ref(false);

const userAvatarSrc = computed(() => {
  const user = authStore.user;
  if (user && user.avatar) {
    return resolveAssetUrl(user.avatar);
  }
  const seed = user?.fullName || "User";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
});

const userInitials = computed(() => {
  const fullName = authStore.user?.fullName?.trim();
  if (!fullName) return "";
  const parts = fullName.split(/\s+/);
  const initials = parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials;
});

const progressBar = ref<HTMLElement | null>(null);
const hasNativeScrollProgress =
  typeof CSS !== "undefined" && CSS.supports("animation-timeline", "scroll(root block)");
let progressFrame = 0;
let progressObserver: ResizeObserver | undefined;
let scrollRange = 0;
let rangeDirty = true;
let lastProgress = -1;

function updateScrollProgress() {
  progressFrame = 0;
  if (rangeDirty) {
    scrollRange = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    rangeDirty = false;
  }
  const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  const next = Math.min(1, Math.max(0, progress));
  if (next !== lastProgress && progressBar.value) {
    progressBar.value.style.setProperty("--scroll-progress", String(next));
    lastProgress = next;
  }
}

function queueScrollProgress() {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateScrollProgress);
}
function invalidateScrollRange() {
  rangeDirty = true;
  queueScrollProgress();
}

onMounted(() => {
  if (hasNativeScrollProgress) return;
  invalidateScrollRange();
  window.addEventListener("scroll", queueScrollProgress, { passive: true });
  window.addEventListener("resize", invalidateScrollRange, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    progressObserver = new ResizeObserver(invalidateScrollRange);
    progressObserver.observe(document.body);
    progressObserver.observe(document.documentElement);
  }
});
onBeforeUnmount(() => {
  if (hasNativeScrollProgress) return;
  window.removeEventListener("scroll", queueScrollProgress);
  window.removeEventListener("resize", invalidateScrollRange);
  progressObserver?.disconnect();
  if (progressFrame) cancelAnimationFrame(progressFrame);
});

onMounted(async () => {
  // Load user profile first to get theme
  if (authStore.isAuthenticated) {
    try {
      // Load user profile if not already loaded
      if (!authStore.user) {
        console.log("Loading user profile...");
        const response = await apiService.auth.getProfile();
        console.log("Profile loaded:", response.data);
        authStore.updateUser(response.data);
      }

      // Fix totalWords if it's 0 by recalculating
      if (authStore.user?.totalWords === 0) {
        console.log("Recalculating totalWords...");
        try {
          const recalcResponse = await apiService.auth.recalculateWords();
          console.log("Total words recalculated:", recalcResponse.data);
          // Update the user store with the correct totalWords
          if (authStore.user) {
            authStore.user.totalWords = recalcResponse.data.totalWords;
          }
        } catch (recalcError) {
          console.error("Failed to recalculate totalWords:", recalcError);
        }
      }

      // Apply theme from user profile
      const theme = authStore.user?.theme || "light";
      console.log("Applying theme:", theme, "from user:", authStore.user);
      isDark.value = theme === "dark";
      applyTheme(theme);

      websocketService.connect();

      // Listen for theme changes from other devices
      websocketService.on("user:theme:changed", (data: any) => {
        if (data.userId === authStore.user?.id) {
          const theme = data.theme;
          isDark.value = theme === "dark";
          applyTheme(theme);
        }
      });

      // Listen for profile changes from other devices/tabs
      websocketService.on("user:profile:updated", (data: any) => {
        if (data.userId === authStore.user?.id) {
          const profile = data.profile;
          authStore.updateUser(profile);

          if (profile.theme) {
            const theme = profile.theme;
            isDark.value = theme === "dark";
            applyTheme(theme);
          }
        }
      });

      websocketService.on("user:layout:changed", (data: any) => {
        if (data.userId === authStore.user?.id) {
          authStore.updateUser({ vocabularyLayout: data.layout });
        }
      });
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // Fallback to local storage
      isDark.value = document.documentElement.classList.contains("dark");
    }
  } else {
    // Fallback to local storage
    isDark.value = document.documentElement.classList.contains("dark");
  }
});

function applyTheme(theme: string) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // Ignore storage errors
  }
}

watch(
  () => authStore.user?.theme,
  (theme) => {
    if (theme !== "light" && theme !== "dark") return;
    isDark.value = theme === "dark";
    applyTheme(theme);
  },
);

const toggleTheme = async () => {
  isDark.value = !isDark.value;
  const theme = isDark.value ? "dark" : "light";
  applyTheme(theme);

  // Save to backend for real-time sync across devices
  if (authStore.isAuthenticated) {
    try {
      await apiService.auth.updateTheme(theme);
      // Update local store
      if (authStore.user) {
        authStore.user.theme = theme;
      }
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    setLanguageMenu(false);
    closeUserMenu();
    isMobileAccountMenuOpen.value = false;
    isMobileVocabMenuOpen.value = false;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  isMobileVocabMenuOpen.value = false;
};

const toggleMobileAccountMenu = () => {
  isMobileAccountMenuOpen.value = !isMobileAccountMenuOpen.value;
  if (isMobileAccountMenuOpen.value) {
    setLanguageMenu(false);
    closeUserMenu();
    isMobileMenuOpen.value = false;
    isMobileVocabMenuOpen.value = false;
  }
};

const closeMobileAccountMenu = () => {
  isMobileAccountMenuOpen.value = false;
};

const toggleMobileVocabMenu = () => {
  isMobileVocabMenuOpen.value = !isMobileVocabMenuOpen.value;
};

const closeMobileMenus = () => {
  closeMobileMenu();
  closeMobileAccountMenu();
};

const setLanguageMenu = (open: boolean) => {
  isLanguageMenuOpen.value = open;
  if (open) {
    closeUserMenu();
    closeMobileMenus();
  }
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    setLanguageMenu(false);
    closeMobileMenus();
  }
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleLogout = () => {
  toast.confirm(
    t("header.logoutConfirm"),
    () => {
      authStore.clearAuth();
      websocketService.disconnect();
      router.push("/");
      closeMobileMenu();
      closeUserMenu();
      closeMobileAccountMenu();
    },
    { label: t("header.logout") },
  );
};
</script>

<script lang="ts">
export default {
  name: "AppHeader",
};
</script>

<style>
.seasonal-progress {
  transform: scaleX(var(--scroll-progress, 0));
  transform-origin: left;
  transition: transform 150ms ease-out;
}

/* Reveal the stripes at their original width so their pattern doesn't stretch. */
[data-seasonal-event="christmas"] .seasonal-progress {
  transform: none;
  clip-path: inset(0 calc((1 - var(--scroll-progress, 0)) * 100%) 0 0);
  transition-property: clip-path;
}

@supports (animation-timeline: scroll(root block)) {
  .seasonal-progress {
    transition: none;
    animation: header-progress-fill auto linear both;
    animation-timeline: scroll(root block);
  }

  [data-seasonal-event="christmas"] .seasonal-progress {
    transition: none;
    animation-name: header-progress-reveal;
  }
}

@keyframes header-progress-fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes header-progress-reveal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0); }
}
</style>
