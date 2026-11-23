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

  </AuthLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useLoginState } from "./composable/manager-state/useLoginState";
import { useLoginHandle } from "./composable/manager-handle/useLoginHandle";
import { useLoginMount } from "./composable/manager-mount/useLoginMount";
import AuthLayout from "../../components/auth/AuthLayout.vue";


// Async Components
const LoginHeader = defineAsyncComponent(() => import("./component/LoginHeader.vue") as any);
const LoginForm = defineAsyncComponent(() => import("./component/LoginForm.vue") as any);
const LoginFooter = defineAsyncComponent(() => import("./component/LoginFooter.vue") as any);

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useLoginState();
const { handleLogin } = useLoginHandle(form, setLoading, setError);

useLoginMount(form);
</script>
