<template>
  <div class="p-4 sm:p-6 md:p-8 space-y-5">
    <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
      <span class="shrink-0 p-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </span>
      <div class="min-w-0">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ t('profile.security.change') }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t(hasPassword === false ? 'profile.security.noPassword' : 'profile.security.description') }}</p>
      </div>
    </div>
    <RouterLink v-if="hasPassword === false" to="/forgot-password" class="inline-flex py-3 px-4 rounded-xl text-sm font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">{{ t('profile.security.reset') }}</RouterLink>
    <form v-else id="profile-password-form" class="space-y-5" @submit.prevent="submit">
      <div v-for="field in fields" :key="field.key">
        <label :for="'profile-password-' + field.key" class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{{ t('profile.security.' + field.key) }}</label>
        <div class="relative">
          <input :id="'profile-password-' + field.key" v-model="form[field.key]" :type="visible[field.key] ? 'text' : 'password'" :autocomplete="field.key === 'current' ? 'current-password' : 'new-password'" :disabled="saving" required :maxlength="field.key === 'current' ? 1024 : 72" class="w-full min-w-0 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-black/40 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium" />
          <button type="button" :aria-label="t(visible[field.key] ? 'profile.security.hide' : 'profile.security.show')" :aria-pressed="visible[field.key]" @click="visible[field.key] = !visible[field.key]" class="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path v-if="visible[field.key]" d="m3 3 18 18"/></svg>
          </button>
        </div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('profile.security.hint') }}</p>
      <p v-if="error" role="alert" class="text-sm text-red-600 dark:text-red-400">{{ t('profile.security.' + error) }}</p>

    </form>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useToast } from '../../../composables/useToast'
import { profileService } from '../service/profile.service'

defineProps<{ hasPassword?: boolean }>()
const emit = defineEmits<{ (e: 'busy', value: boolean): void; (e: 'success'): void }>()
const { t } = useI18n()
const { showSuccess } = useToast()
const fields = [{ key: 'current' }, { key: 'next' }, { key: 'confirm' }] as const
const form = reactive({ current: '', next: '', confirm: '' })
const visible = reactive({ current: false, next: false, confirm: false })
const saving = ref(false)
const error = ref('')
function clear() {
  for (const { key } of fields) { form[key] = ''; visible[key] = false }
  error.value = ''
}

async function submit() {
  if (saving.value) return
  error.value = ''
  if (form.next.length < 8 || new TextEncoder().encode(form.next).length > 72) { error.value = 'hint'; return }
  if (form.next !== form.confirm) { error.value = 'mismatch'; return }
  if (form.next === form.current) { error.value = 'same'; return }
  saving.value = true
  emit('busy', true)
  let changed = false
  try {
    const result = await profileService.changePassword(form.current, form.next)
    if (result.success) {
      clear()
      showSuccess(t('profile.security.success'))
      changed = true
    } else {
      const codes: Record<string, string> = { INCORRECT_PASSWORD: 'incorrect', SAME_PASSWORD: 'same', NO_PASSWORD: 'noPassword', PASSWORD_TOO_LONG: 'hint', PASSWORD_CHANGED: 'conflict' }
      error.value = codes[result.error || ''] || 'failed'
    }
  } finally { saving.value = false; emit('busy', false) }
  if (changed) emit('success')
}
</script>
