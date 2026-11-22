<template>
  <span
    aria-hidden="true"
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg"
    :class="[
      sizeClass,
      bare
        ? 'bg-transparent text-black/70 dark:text-white/70'
        : neutral
          ? 'bg-black/5 text-black/70 dark:bg-white/5 dark:text-white/70'
          : active
            ? 'bg-white/20 text-white'
            : 'bg-primary-500/10 text-primary-600 dark:bg-white/10 dark:text-gray-200',
    ]"
  >
    <img
      v-if="isUploaded && !imageFailed"
      :src="imageUrl"
      alt=""
      class="h-full w-full object-cover"
      loading="lazy"
      @error="imageFailed = true"
    />
    <component v-else :is="iconComponent" class="h-[65%] w-[65%]" />
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { API_URL } from "../../services/api.service";
import { getIconComponent } from "../../utils/iconRenderer";

const props = withDefaults(
  defineProps<{
    icon?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
    active?: boolean;
    neutral?: boolean;
    bare?: boolean;
  }>(),
  { size: "sm" },
);
const imageFailed = ref(false);
const isUploaded = computed(() =>
  /^\/uploads\/tab-icons\/[a-f0-9-]{36}\.(?:png|jpg|webp)$/i.test(props.icon ?? ""),
);
const imageUrl = computed(() => (isUploaded.value ? API_URL.replace(/\/$/, "") + props.icon : ""));
const iconComponent = computed(() =>
  getIconComponent(!isUploaded.value && props.icon ? props.icon : "book"),
);
const sizeClass = computed(
  () =>
    ({
      xs: "h-5 w-5 rounded-md",
      sm: "h-8 w-8",
      md: "h-10 w-10 rounded-xl",
      lg: "h-14 w-14 rounded-2xl",
    })[props.size],
);

watch(
  () => props.icon,
  () => {
    imageFailed.value = false;
  },
);
</script>
