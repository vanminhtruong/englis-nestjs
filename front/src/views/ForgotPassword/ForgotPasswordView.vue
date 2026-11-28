<template>
  <AuthLayout>
    <div v-scroll-reveal class="mb-6 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
        <svg v-if="step !== 'success'" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <svg v-else class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m5 12 4 4L19 6" />
        </svg>
      </div>
      <h1 class="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-2xl font-bold leading-tight text-transparent min-[380px]:text-3xl">
        {{ step === 'success' ? t('forgotPassword.successTitle') : step === 'code' ? t('forgotPassword.codeTitle') : t('forgotPassword.title') }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {{ step === 'success' ? t('forgotPassword.successText') : step === 'code' ? t('forgotPassword.codeIntro') : t('forgotPassword.intro') }}
      </p>
    </div>

    <form v-scroll-reveal v-if="step === 'email'" class="space-y-5" @submit.prevent="requestCode">
      <label class="block min-w-0">
        <span class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('forgotPassword.email') }}</span>
        <input
          v-model.trim="email"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          maxlength="254"
          required
          :placeholder="t('forgotPassword.emailPlaceholder')"
          class="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
        />
      </label>
      <p v-if="error" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{{ error }}</p>
      <button
        type="submit"
        :disabled="submitting"
        class="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ submitting ? t('forgotPassword.sending') : t('forgotPassword.sendCode') }}
      </button>
    </form>

    <form v-scroll-reveal v-else-if="step === 'code'" class="space-y-4" @submit.prevent="resetPassword">
      <div class="rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm leading-6 text-gray-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-gray-200" role="status">
        {{ notice }}
        <span class="mt-1 block break-all font-medium text-primary-700 dark:text-primary-300">{{ email }}</span>
      </div>

      <label class="block min-w-0">
        <span class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('forgotPassword.code') }}</span>
        <input
          v-model="code"
          name="one-time-code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          minlength="6"
          pattern="[0-9]{6}"
          required
          :placeholder="t('forgotPassword.codePlaceholder')"
          class="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-xl font-semibold tracking-[0.25em] text-gray-900 outline-none transition-all placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </label>
      <label class="block min-w-0">
        <span class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('forgotPassword.newPassword') }}</span>
        <span class="relative block">
          <input
            v-model="password"
            name="new-password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            maxlength="128"
            class="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button type="button" class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-primary-400" :aria-label="showPassword ? t('forgotPassword.hidePassword') : t('forgotPassword.showPassword')" @click="showPassword = !showPassword">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path v-if="showPassword" d="m3 3 18 18"/></svg>
          </button>
        </span>
        <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">{{ t('forgotPassword.passwordHint') }}</span>
      </label>
      <label class="block min-w-0">
        <span class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('forgotPassword.confirmPassword') }}</span>
        <span class="relative block">
          <input
            v-model="confirmation"
            name="confirm-password"
            :type="showConfirmation ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            maxlength="128"
            class="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button type="button" class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-primary-400" :aria-label="showConfirmation ? t('forgotPassword.hidePassword') : t('forgotPassword.showPassword')" @click="showConfirmation = !showConfirmation">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path v-if="showConfirmation" d="m3 3 18 18"/></svg>
          </button>
        </span>
      </label>

      <p v-if="error" role="alert" class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{{ error }}</p>
      <button
        type="submit"
        :disabled="submitting"
        class="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ submitting ? t('forgotPassword.resetting') : t('forgotPassword.reset') }}
      </button>

      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
        <button type="button" class="font-medium text-primary-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 dark:text-primary-400 dark:disabled:text-gray-500" :disabled="!canResend" @click="requestCode">
          {{ t('forgotPassword.resend') }}<span v-if="remainingSeconds > 0"> ({{ remainingSeconds }}s)</span>
        </button>
        <button type="button" class="text-gray-600 hover:underline dark:text-gray-300" @click="changeEmail">{{ t('forgotPassword.changeEmail') }}</button>
      </div>
    </form>

    <RouterLink
      v-if="step === 'success'"
      :to="authStore.isAuthenticated ? '/profile' : '/login'"
      class="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary-500/20"
    >{{ t('forgotPassword.backToLogin') }}</RouterLink>

    <RouterLink v-else :to="authStore.isAuthenticated ? '/profile' : '/login'" class="mt-6 flex min-h-10 items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
      <span aria-hidden="true">←</span>{{ t('forgotPassword.backToLogin') }}
    </RouterLink>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth.store';
const authStore = useAuthStore();
import AuthLayout from '../../components/auth/AuthLayout.vue';
import { useForgotPasswordHandle } from './composable/useForgotPasswordHandle';

const {
  t, step, email, code, password, confirmation, showPassword,
  showConfirmation, submitting, error, notice, remainingSeconds, canResend,
  requestCode, resetPassword, changeEmail,
} = useForgotPasswordHandle();
</script>
