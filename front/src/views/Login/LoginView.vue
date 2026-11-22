<template>
  <AuthLayout>
        <LoginHeader :t="t" />

        <LoginForm
          :form="form"
          :loading="loading"
          :error="error"
          :t="t"
          @submit="handleLogin"
          @update:form="(val: Record<string, unknown>) => Object.assign(form, val)"
        />

        <LoginFooter :t="t" />
        <ServerConnectionSettings v-if="isGithubPages || !API_URL" />
  </AuthLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useLoginState } from "./composable/manager-state/useLoginState";
import { useLoginHandle } from "./composable/manager-handle/useLoginHandle";
import { useLoginMount } from "./composable/manager-mount/useLoginMount";
import ServerConnectionSettings from "../../components/common/ServerConnectionSettings.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { API_URL } from "../../services/api.service";

const isGithubPages = import.meta.env.PROD && import.meta.env.BASE_URL !== "/";

// Async Components
const LoginHeader = defineAsyncComponent(() => import("./component/LoginHeader.vue") as any);
const LoginForm = defineAsyncComponent(() => import("./component/LoginForm.vue") as any);
const LoginFooter = defineAsyncComponent(() => import("./component/LoginFooter.vue") as any);

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useLoginState();
const { handleLogin } = useLoginHandle(form, setLoading, setError);

useLoginMount(form);
</script>
