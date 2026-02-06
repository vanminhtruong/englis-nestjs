<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"
  >
    <div class="text-center">
      <div
        class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
      ></div>
      <p class="text-gray-600 dark:text-gray-400">Processing login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth.store";
import apiService from "../../services/api.service";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token as string;

  if (token) {
    try {
      // Set token temporarily to make the request
      authStore.setAuth({} as any, token);

      // Fetch user profile
      const response = await apiService.auth.getProfile();

      // Update store with full user data
      authStore.setAuth(response.data, token);

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Login callback error:", error);
      router.push("/login?error=google_auth_failed");
    }
  } else {
    router.push("/login");
  }
});
</script>
