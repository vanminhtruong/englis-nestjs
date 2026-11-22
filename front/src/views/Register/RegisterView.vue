<template>
  <AuthLayout>
        <RegisterHeader :t="t" />

        <RegisterForm
          :form="form"
          :loading="loading"
          :error="error"
          :t="t"
          @submit="handleRegister"
          @update:form="(val: Record<string, unknown>) => Object.assign(form, val)"
        />

        <RegisterFooter :t="t" />
  </AuthLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { useRegisterState } from "./composable/manager-state/useRegisterState";
import { useRegisterHandle } from "./composable/manager-handle/useRegisterHandle";
import { useRegisterMount } from "./composable/manager-mount/useRegisterMount";

// Async Components
const RegisterHeader = defineAsyncComponent(
  () => import("./component/RegisterHeader.vue") as any
);
const RegisterForm = defineAsyncComponent(
  () => import("./component/RegisterForm.vue") as any
);
const RegisterFooter = defineAsyncComponent(
  () => import("./component/RegisterFooter.vue") as any
);

const { t } = useI18n();
const { form, loading, error, setLoading, setError } = useRegisterState();
const { handleRegister } = useRegisterHandle(form, setLoading, setError);

useRegisterMount();
</script>
