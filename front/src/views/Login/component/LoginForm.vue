<template>
  <form @submit.prevent="emit('submit')" class="space-y-6" novalidate>
    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("login.email") }}
      </label>
      <div class="relative">
        <div
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary-500 transition-colors pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <input
          :value="form.email"
          @input="updateField('email', $event)"
          type="email"
          :placeholder="t('login.emailPlaceholder')"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
      </div>
    </div>

    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("login.password") }}
      </label>
      <div class="relative">
        <div
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-primary-500 transition-colors pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <input
          :value="form.password"
          @input="updateField('password', $event)"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('login.passwordPlaceholder')"
          class="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors focus:outline-none"
          :title="
            showPassword ? t('login.hidePassword') : t('login.showPassword')
          "
        >
          <svg
            v-if="!showPassword"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.221 3.475.623m1.42 1.42c1.479 1.17 2.62 2.72 3.23 4.457-1.274 4.057-5.064 7-9.542 7-1.23 0-2.39-.221-3.48-.625m4.36-4.36a3 3 0 014.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="relative flex items-center group">
        <input
          id="remember"
          :checked="form.rememberMe"
          @change="updateField('rememberMe', $event)"
          type="checkbox"
          class="peer sr-only"
        />
        <label
          for="remember"
          class="flex items-center cursor-pointer select-none"
        >
          <!-- Custom Checkbox Box -->
          <div
            class="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 transition-all duration-300 ease-out peer-checked:border-transparent peer-checked:shadow-lg peer-checked:shadow-primary-500/40 group-hover:scale-110 group-hover:border-primary-400 dark:group-hover:border-primary-500/50"
          >
            <!-- Background Gradient when checked -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-[inherit] opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
            ></div>

            <!-- Checkmark SVG -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="relative w-3.5 h-3.5 text-white transform transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              :class="
                form.rememberMe
                  ? 'scale-100 opacity-100 rotate-0'
                  : 'scale-0 opacity-0 -rotate-90'
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <!-- Label Text -->
          <span
            class="ml-2 text-sm font-medium transition-all duration-300"
            :class="
              form.rememberMe
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent font-bold'
                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
            "
          >
            {{ t("login.rememberMe") }}
          </span>
        </label>
      </div>

      <a
        href="#"
        class="text-sm text-primary-600 hover:text-primary-500 font-medium hover:underline"
      >
        {{ t("login.forgotPassword") }}
      </a>
    </div>

    <div
      v-if="error"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
    >
      <p class="text-red-500 text-sm">{{ error }}</p>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? "Loading..." : t("login.loginButton") }}
    </button>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-white dark:bg-black text-gray-500 pb-1"
          >Or continue with</span
        >
      </div>
    </div>

    <button
      type="button"
      @click="handleGoogleLogin"
      class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-medium transition-all"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          class="text-[#4285F4]"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          class="text-[#34A853]"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          class="text-[#FBBC05]"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          class="text-[#EA4335]"
        />
      </svg>
      Google
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { LoginForm } from "../interface/login.interface";

const showPassword = ref(false);

const props = defineProps<{
  form: LoginForm;
  loading: boolean;
  error: string | null;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "update:form", val: LoginForm): void;
}>();

const updateField = (field: keyof LoginForm, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.type === "checkbox" ? target.checked : target.value;

  emit("update:form", {
    ...props.form,
    [field]: value,
  });
};

const handleGoogleLogin = () => {
  window.location.href = "http://localhost:3000/auth/google";
};
</script>
