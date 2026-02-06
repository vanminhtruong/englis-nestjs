<template>
  <form @submit.prevent="emit('submit')" class="space-y-6" novalidate>
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.fullName") }}
      </label>
      <input
        :value="form.fullName"
        @input="updateField('fullName', $event)"
        type="text"
        :placeholder="t('register.fullNamePlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.email") }}
      </label>
      <input
        :value="form.email"
        @input="updateField('email', $event)"
        type="email"
        :placeholder="t('register.emailPlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.password") }}
      </label>
      <input
        :value="form.password"
        @input="updateField('password', $event)"
        type="password"
        :placeholder="t('register.passwordPlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {{ t("register.confirmPassword") }}
      </label>
      <input
        :value="form.confirmPassword"
        @input="updateField('confirmPassword', $event)"
        type="password"
        :placeholder="t('register.confirmPasswordPlaceholder')"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        required
      />
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
import type { RegisterForm } from "../interface/register.interface";

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
