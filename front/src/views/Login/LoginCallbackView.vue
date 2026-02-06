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
import { apiClient } from "../../services/api.service";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token as string;

  if (token) {
    try {
      // Store token in localStorage first
      localStorage.setItem("token", token);

      // Fetch user profile with token directly in header
      const response = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update store with full user data
      authStore.setAuth(response.data, token);

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Login callback error:", error);
      localStorage.removeItem("token");
      router.push("/login?error=google_auth_failed");
    }
  } else {
    router.push("/login");
  }
});
</script>
