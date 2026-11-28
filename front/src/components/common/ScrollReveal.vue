<template>
  <component :is="as" v-scroll-reveal.rise>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { vScrollReveal } from '../../directives/scrollReveal'
withDefaults(defineProps<{ as?: string }>(), { as: 'div' })
</script>
