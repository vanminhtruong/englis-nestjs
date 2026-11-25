<template>
  <div class="min-w-0 space-y-3" data-synonym-editor>
    <p class="text-xs leading-relaxed text-black/50 dark:text-white/50">{{ t('vocabulary.synonymHint') }}</p>
    <div ref="editorList" data-synonym-editor-list :style="{ maxHeight: editorHeight ? `min(${editorHeight}, 52dvh)` : '52dvh', scrollbarGutter: modelValue.length > 4 ? 'stable' : undefined }" class="min-w-0 space-y-3 overflow-y-auto overscroll-contain scrollbar-custom">
    <div v-for="(item,index) in modelValue" :key="index" class="min-w-0 space-y-3 rounded-xl border border-black/10 bg-black/[0.015] p-3 dark:border-white/10 dark:bg-white/[0.025]">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-semibold text-primary-600 dark:text-primary-300">{{ t('vocabulary.synonymWord') }} {{ index+1 }}</span>
        <button type="button" :disabled="disabled" :aria-label="t('vocabulary.synonymRemove')" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/50 hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-red-900/20 dark:hover:text-red-400" @click="emit('update:modelValue',modelValue.filter((_,i)=>i!==index))"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      </div>
      <div class="grid min-w-0 gap-2 sm:grid-cols-2">
        <input :value="item.word" maxlength="120" :aria-label="t('vocabulary.synonymWord')" :placeholder="t('vocabulary.synonymWord')" :disabled="disabled" class="synonym-input" @input="change(index,'word',($event.target as HTMLInputElement).value)" />
        <input :value="item.pronunciation || ''" maxlength="200" :aria-label="t('vocabulary.synonymIpa')" :placeholder="t('vocabulary.synonymIpa')" :disabled="disabled" class="synonym-input" @input="change(index,'pronunciation',($event.target as HTMLInputElement).value)" />
      </div>
      <div class="min-w-0 space-y-1.5">
        <label class="block text-sm font-medium text-black/70 dark:text-white/70">{{ t('vocabulary.synonymMeaning') }}</label>
        <textarea :value="item.meaning || ''" maxlength="500" rows="2" data-synonym-meaning :aria-label="t('vocabulary.synonymMeaning')" :placeholder="meaning || t('vocabulary.synonymMeaningPlaceholder')" :disabled="disabled" class="synonym-input resize-y" @input="change(index,'meaning',($event.target as HTMLTextAreaElement).value)" />
        <p v-if="!item.meaning?.trim()" class="text-xs break-words text-black/50 dark:text-white/50">{{ t('vocabulary.synonymMeaningInherited') }}</p>
      </div>
      <ModalSelect data-synonym-pos :model-value="item.partOfSpeech ?? 'inherit'" :label="t('vocabulary.partOfSpeech')" :options="posOptions" :disabled="disabled" @update:model-value="setPart(index,String($event))" />
    </div>
    </div>
    <p v-if="invalid" class="text-xs text-red-600 dark:text-red-400" role="alert">{{ t('vocabulary.synonymInvalid') }}</p>
    <div class="flex items-center justify-between gap-2">
      <button type="button" :disabled="disabled || modelValue.length>=20" class="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-500/20 disabled:opacity-50 dark:text-primary-300" @click="addSynonym"><span aria-hidden="true">+</span>{{ t('vocabulary.synonymAdd') }}</button>
      <span class="text-xs text-black/40 dark:text-white/40">{{ modelValue.length }}/20</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useVisibleRows } from '../../../composables/useVisibleRows'
import { useI18n } from 'vue-i18n'
import ModalSelect from '../../../components/common/ModalSelect.vue'
import { synonymKey, type VocabularySynonym } from '../utils/synonyms'
import { partOfSpeechOptions, type PartOfSpeech } from '../utils/partOfSpeech'
const props=defineProps<{modelValue: VocabularySynonym[]; word: string; meaning?: string; partOfSpeech?: PartOfSpeech; disabled?: boolean}>()
const emit=defineEmits<{ 'update:modelValue':[value:VocabularySynonym[]] }>()
const {t}=useI18n()
const editorList=ref<HTMLElement|null>(null)
const editorHeight=useVisibleRows(editorList,()=>props.modelValue.length,4)
async function addSynonym(){
  if(props.disabled||props.modelValue.length>=20)return
  emit('update:modelValue',[...props.modelValue,{word:'',pronunciation:''}])
  await nextTick()
  const list=editorList.value
  if(list)list.scrollTop=list.scrollHeight
}
const posOptions=computed(()=>[{value:'inherit',label:t('vocabulary.synonymInherit')+' · '+t('vocabulary.pos_'+(props.partOfSpeech||'unspecified'))},...partOfSpeechOptions(t)])
const invalid=computed(()=>{const seen=new Set([synonymKey(props.word)]);return props.modelValue.some(item=>{const k=synonymKey(item.word);if(!k||seen.has(k))return true;seen.add(k);return false})})
function change(index:number, field:'word'|'pronunciation'|'meaning',value:string){emit('update:modelValue',props.modelValue.map((item,i)=>i===index?{...item,[field]:value}:item))}
function setPart(index:number,value:string){if(props.disabled)return;emit('update:modelValue',props.modelValue.map((item,i)=>{if(i!==index)return item;const next={...item};if(value==='inherit')delete next.partOfSpeech;else next.partOfSpeech=value as PartOfSpeech;return next}))}
</script>
<style scoped lang="postcss">
.synonym-input { @apply min-h-[40px] w-full min-w-0 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white; }
</style>
