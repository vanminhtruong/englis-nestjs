<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-white/80 mb-3">
      {{ label || 'Select Icon' }}
    </label>
    
    <!-- Selected Icon Display - Compact -->
    <button
      type="button"
      @click="showPicker = !showPicker"
      class="w-full flex items-center gap-3 p-3 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all group"
    >
      <div 
        class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        :style="{ backgroundColor: selectedColor + '20', border: `2px solid ${selectedColor}` }"
      >
        <component :is="getIconComponent(modelValue)" :color="selectedColor" />
      </div>
      <div class="flex-1 text-left">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ getIconName(modelValue) }}</p>
        <p class="text-xs text-gray-500 dark:text-white/60">Click to change icon</p>
      </div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        class="text-gray-400 dark:text-white/40 transition-transform"
        :class="{ 'rotate-180': showPicker }"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Icon Picker Modal/Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="showPicker" 
        class="mt-2 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <!-- Search -->
        <div class="mb-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search icons..."
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
          />
        </div>

        <!-- Icon Grid with scroll -->
        <div class="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          <button
            v-for="icon in filteredIcons"
            :key="icon"
            type="button"
            @click="selectIcon(icon)"
            :title="getIconName(icon)"
            class="aspect-square rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all relative group"
            :class="{ 
              'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 dark:ring-primary-400': modelValue === icon,
              'hover:scale-110': modelValue !== icon
            }"
          >
            <component :is="getIconComponent(icon)" :color="modelValue === icon ? selectedColor : 'currentColor'" class="w-5 h-5" />
            
            <!-- Tooltip on hover -->
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {{ getIconName(icon) }}
            </div>
          </button>
        </div>

        <!-- No results -->
        <div v-if="filteredIcons.length === 0" class="text-center py-8 text-gray-500 dark:text-white/50 text-sm">
          No icons found
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getIconComponent } from '../../../utils/iconRenderer'

const props = defineProps<{
  modelValue: string
  label?: string
  selectedColor?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const searchQuery = ref('')

// Icon list from the image - Lucide icons mapping
const iconList = [
  'folder',
  'dollar-sign',
  'tablet',
  'graduation-cap',
  'pencil',
  'feather',
  'code',
  'smile',
  'music',
  'trash',
  'scissors',
  'palette',
  'sparkles',
  'flower',
  'lotus',
  'camera',
  'bar-chart',
  'disc',
  'dumbbell',
  'book',
  'scales',
  'mic',
  'plane',
  'globe',
  'wrench',
  'paw-print',
  'flask',
  'target',
  'heart',
  'coffee',
]

function selectIcon(icon: string) {
  emit('update:modelValue', icon)
  showPicker.value = false
  searchQuery.value = ''
}

function getIconName(iconKey: string): string {
  return iconKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const filteredIcons = computed(() => {
  if (!searchQuery.value.trim()) {
    return iconList
  }
  
  const query = searchQuery.value.toLowerCase()
  return iconList.filter(icon => 
    icon.toLowerCase().includes(query) ||
    getIconName(icon).toLowerCase().includes(query)
  )
})
</script>

