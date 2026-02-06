<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-black dark:via-black dark:to-black flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
      >
        <RegisterHeader :t="t" />

        <RegisterForm
          :form="form"
          :loading="loading"
          :error="error"
          :t="t"
          @submit="handleRegister"
          @update:form="(val) => Object.assign(form, val)"
        />

        <RegisterFooter :t="t" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
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
