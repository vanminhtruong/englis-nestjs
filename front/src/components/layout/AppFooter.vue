<template>
  <footer class="bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-black text-gray-300 dark:text-gray-200 mt-auto">
    <!-- Main Footer Content -->
    <div class="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
      <!-- Brand Section -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <span class="text-2xl font-bold text-white">{{ t('footer.brandTitle') }}</span>
        </div>
        <p class="text-gray-400 dark:text-gray-500 leading-relaxed mb-6 max-w-sm">
          {{ t('footer.brandDescription') }}
        </p>
        <div class="flex gap-3">
          <a href="#" class="w-10 h-10 bg-white/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-primary-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" class="w-10 h-10 bg-white/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-primary-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
          </a>
          <a href="#" class="w-10 h-10 bg-white/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-primary-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            </svg>
          </a>
          <a href="#" class="w-10 h-10 bg-white/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-primary-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <a href="#" class="w-10 h-10 bg-white/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-primary-500 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2a29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">{{ t('footer.quickLinks') }}</h3>
        <ul class="space-y-3">
          <li><RouterLink to="/" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.linkHome') }}</RouterLink></li>
          <li><RouterLink to="/vocabulary" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.linkVocabulary') }}</RouterLink></li>
          <li><RouterLink to="/practice" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.linkPractice') }}</RouterLink></li>
          <li><RouterLink to="/categories" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.linkCategories') }}</RouterLink></li>
          <li><RouterLink to="/history" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.linkHistory') }}</RouterLink></li>
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">{{ t('footer.support') }}</h3>
        <ul class="space-y-3">
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.supportHelpCenter') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.supportContactUs') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.supportReportBug') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.supportFaq') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.supportCommunityGuidelines') }}</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="text-lg font-semibold text-white mb-4">{{ t('footer.legal') }}</h3>
        <ul class="space-y-3">
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.legalTerms') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.legalPrivacy') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.legalCookie') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.legalDmca') }}</a></li>
          <li><a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.legalLicenses') }}</a></li>
        </ul>
      </div>
    </div>

    <!-- Newsletter Section -->
    <div class="max-w-[1400px] mx-auto px-8 pb-12">
      <div class="bg-white/5 dark:bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold text-white mb-2">{{ t('footer.stayUpdatedTitle') }}</h3>
          <p class="text-gray-400 dark:text-gray-500">
            {{ t('footer.stayUpdatedSubtitle') }}
          </p>
        </div>
        <form @submit.prevent="handleSubscribe" class="max-w-md mx-auto flex gap-3">
          <div class="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <input 
              type="email" 
              v-model="email"
              :placeholder="t('footer.subscribePlaceholder')"
              class="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <button type="submit" class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2">
            <span>{{ t('footer.subscribeCta') }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/10 dark:border-white/5">
      <div class="max-w-[1400px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-400 dark:text-gray-500 text-sm">
          {{ t('footer.copyright', { year: currentYear }) }}
        </p>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.sitemap') }}</a>
          <span class="text-gray-600 dark:text-gray-600">•</span>
          <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.accessibility') }}</a>
          <span class="text-gray-600 dark:text-gray-600">•</span>
          <a href="#" class="text-gray-400 dark:text-gray-500 hover:text-primary-400 transition-colors">{{ t('footer.status') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const email = ref('')
const currentYear = computed(() => new Date().getFullYear())
const { t } = useI18n()

const handleSubscribe = () => {
  if (email.value) {
    console.log('Subscribing email:', email.value)
    email.value = ''
  }
}
</script>

<script lang="ts">
export default {
  name: 'AppFooter'
}
</script>
