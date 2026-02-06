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
            <div class="relative flex items-center group">
              <input
                id="remember"
                v-model="form.rememberMe"
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
