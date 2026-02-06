<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-black dark:via-black dark:to-black flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
      >
        <LoginHeader :t="t" />

        <LoginForm
          :form="form"
          :loading="loading"
          :error="error"
          :t="t"
          @submit="handleLogin"
          @update:form="(val) => Object.assign(form, val)"
        />

        <LoginFooter :t="t" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useLoginState } from "./composable/manager-state/useLoginState";
import { useLoginHandle } from "./composable/manager-handle/useLoginHandle";
import { useLoginMount } from "./composable/manager-mount/useLoginMount";

// Async Components
const LoginHeader = defineAsyncComponent(
  () => import("./component/LoginHeader.vue") as any
);
const LoginForm = defineAsyncComponent(
  () => import("./component/LoginForm.vue") as any
);
const LoginFooter = defineAsyncComponent(
  () => import("./component/LoginFooter.vue") as any
);

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useLoginState();
const { handleLogin } = useLoginHandle(form, setLoading, setError);

useLoginMount(form);
</script>
