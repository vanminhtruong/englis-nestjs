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
            {{ t("login.title") }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("login.subtitle") }}
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ t("login.email") }}
            </label>
            <input
              v-model="form.email"
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
              v-model="form.password"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <label
                for="remember"
                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none"
              >
                {{ t("login.rememberMe") }}
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
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("login.noAccount") }}
            <RouterLink
              to="/register"
              class="text-primary-500 hover:text-primary-600 font-semibold ml-1"
            >
              {{ t("login.register") }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLoginState } from "./composable/manager-state/useLoginState";
import { useLoginHandle } from "./composable/manager-handle/useLoginHandle";
import { useLoginMount } from "./composable/manager-mount/useLoginMount";

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useLoginState();
const { handleLogin } = useLoginHandle(form, setLoading, setError);

useLoginMount(form);
</script>
