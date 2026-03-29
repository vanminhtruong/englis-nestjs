<template>
  <form @submit.prevent="emit('submit')" class="space-y-6" novalidate>
    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.fullName") }}
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <input
          :value="form.fullName"
          @input="updateField('fullName', $event)"
          type="text"
          :placeholder="t('register.fullNamePlaceholder')"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
      </div>
    </div>

    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.email") }}
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
          :placeholder="t('register.emailPlaceholder')"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
      </div>
    </div>

    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.password") }}
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
          :placeholder="t('register.passwordPlaceholder')"
          class="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors focus:outline-none"
          :title="
            showPassword
              ? t('register.hidePassword')
              : t('register.showPassword')
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

    <div class="relative group/field">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.confirmPassword") }}
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
          :value="form.confirmPassword"
          @input="updateField('confirmPassword', $event)"
          :type="showConfirmPassword ? 'text' : 'password'"
          :placeholder="t('register.confirmPasswordPlaceholder')"
          class="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          required
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors focus:outline-none"
          :title="
            showConfirmPassword
              ? t('register.hidePassword')
              : t('register.showPassword')
          "
        >
          <svg
            v-if="!showConfirmPassword"
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

    <div
      v-if="error"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
    >
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? "Loading..." : t("register.registerButton") }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { RegisterForm } from "../interface/register.interface";

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const props = defineProps<{
  form: RegisterForm;
  loading: boolean;
  error: string | null;
  t: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "update:form", val: RegisterForm): void;
}>();

const updateField = (field: keyof RegisterForm, event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:form", {
    ...props.form,
    [field]: target.value,
  });
};
</script>
