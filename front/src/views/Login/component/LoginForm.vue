<template>
  <form @submit.prevent="emit('submit')" class="space-y-6" novalidate>
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("login.email") }}
      </label>
      <input
        :value="form.email"
        @input="updateField('email', $event)"
        type="email"
        :placeholder="t('login.emailPlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("login.password") }}
      </label>
      <input
        :value="form.password"
        @input="updateField('password', $event)"
        type="password"
        :placeholder="t('login.passwordPlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
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
import type { LoginForm } from "../interface/login.interface";

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
