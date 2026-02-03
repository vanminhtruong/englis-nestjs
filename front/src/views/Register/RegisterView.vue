<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-black dark:via-black dark:to-black flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
      >
        <div class="text-center mb-8">
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
          >
            {{ t("register.title") }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("register.subtitle") }}
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6" novalidate>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ t("register.fullName") }}
            </label>
            <input
              v-model="form.fullName"
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
              v-model="form.email"
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
              v-model="form.password"
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
              v-model="form.confirmPassword"
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

        <div class="mt-6 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("register.haveAccount") }}
            <RouterLink
              to="/login"
              class="text-primary-500 hover:text-primary-600 font-semibold ml-1"
            >
              {{ t("register.login") }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useRegisterState } from "./composable/manager-state/useRegisterState";
import { useRegisterHandle } from "./composable/manager-handle/useRegisterHandle";
import { useRegisterMount } from "./composable/manager-mount/useRegisterMount";

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useRegisterState();
const { handleRegister } = useRegisterHandle(form, setLoading, setError);

useRegisterMount();
</script>
