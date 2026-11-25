<template>
  <div class="min-w-0" data-word-switcher>
    <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <component :is="heading" :class="[wordClass, onImage ? 'text-white' : 'text-black dark:text-white']" class="min-w-0 break-words leading-tight [overflow-wrap:anywhere]" data-displayed-word>{{ active.word }}</component>
      <button v-if="active.word" type="button" data-synonym-speak :title="t('vocabulary.speak')" :aria-label="t('vocabulary.speak')+': '+active.word" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-500" :class="onImage?'bg-black/30 text-white hover:bg-black/50':'text-primary-500 hover:bg-primary-500/10 dark:text-primary-400'" @click.stop="speakPreferred(active.word)">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/></svg>
      </button>
    </div>
    <div v-if="active.pronunciation || active.partOfSpeech && active.partOfSpeech!=='unspecified'" class="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <PartOfSpeechLabel :value="active.partOfSpeech" :on-image="onImage"/>
      <span v-if="active.pronunciation" data-displayed-ipa class="min-w-0 break-words text-sm [overflow-wrap:anywhere]" :class="onImage?'text-white/70':'text-black/50 dark:text-white/50'">{{ active.pronunciation }}</span>
    </div>
    <div v-if="entries.length>1" class="mt-2 flex min-w-0 flex-wrap items-center gap-2">
      <ModalSelect data-synonym-switch class="max-w-full" :model-value="selected" :label="t('vocabulary.synonyms') + ' ('+(entries.length-1)+')'" :options="options" compact-trigger pill-trigger :max-visible-options="4" :on-image="onImage" :disabled="saving" @update:model-value="choose(String($event))">
        <template #trigger-content>
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/></svg>
          <span class="min-w-0 truncate">{{ t('vocabulary.synonyms') }}</span>
          <span class="shrink-0 rounded-full bg-primary-500/15 px-1.5 tabular-nums">{{ entries.length-1 }}</span>
        </template>
        <template #option-content="{ option }">
          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 flex-wrap items-center gap-1.5">
              <span class="min-w-0 font-semibold break-words [overflow-wrap:anywhere]">{{ option.label }}</span>
              <span v-if="option.value===source?.word" class="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{{ t('vocabulary.synonymOriginal') }}</span>
              <PartOfSpeechLabel :value="entries.find(e=>e.word===option.value)?.partOfSpeech" />
            </div>
            <p v-if="synonymMeaning(source?.synonyms?.find(e=>e.word===option.value),source)" class="mt-1 break-words text-xs font-normal opacity-80 [overflow-wrap:anywhere]" data-synonym-option-meaning>{{ synonymMeaning(source?.synonyms?.find(e=>e.word===option.value),source) }}</p>
            <p v-if="entries.find(e=>e.word===option.value)?.pronunciation" class="mt-1 text-xs font-normal opacity-65 break-words">{{ entries.find(e=>e.word===option.value)?.pronunciation }}</p>
          </div>
        </template>
      </ModalSelect>
      <span v-if="selected!==source?.word" class="min-w-0 break-words text-[11px] leading-tight [overflow-wrap:anywhere]" :class="onImage?'text-white/70':'text-black/50 dark:text-white/50'">{{ t('vocabulary.synonymOf',{word:source?.word}) }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import apiService from '../../services/api.service'
import { websocketService } from '../../services/websocket.service'
import { useVocabularyStore } from '../../stores/vocabulary.store'
import { useToast } from '../../composables/useToast'
import { synonymSelectionEvents as localSelections } from '../../views/Vocabulary/utils/synonymSelectionEvents'
import { useI18n } from 'vue-i18n'
import ModalSelect from './ModalSelect.vue'
import PartOfSpeechLabel from './PartOfSpeechLabel.vue'
import { speakPreferred } from '../../composables/usePreferredVoice'
import { synonymEntries, synonymMeaning, type SynonymSource } from '../../views/Vocabulary/utils/synonyms'

const props=withDefaults(defineProps<{source?:SynonymSource|null;onImage?:boolean; heading?:string;wordClass?:string}>(),{heading:'h3',wordClass:'text-2xl font-bold'})
const {t}=useI18n()
const entries=computed(()=>props.source?[{word:props.source.word,pronunciation:props.source.pronunciation,partOfSpeech:props.source.partOfSpeech},...synonymEntries(props.source).map(item=>({...item,partOfSpeech:item.partOfSpeech??props.source?.partOfSpeech}))]:[])
const selected=ref('')
const saving=ref(false)
const store=useVocabularyStore()
const {showError}=useToast()
const recordId=computed(()=>props.source?.id ?? props.source?.vocabularyId)
const validSelection=(value?:string|null)=>entries.value.find(e=>e.word===value)?.word ?? props.source?.word ?? ''
function receive(data:{id:string;selectedSynonym:string|null}) {
  if(data.id!==recordId.value)return
  if(props.source) props.source.selectedSynonym=data.selectedSynonym
  if(!saving.value)selected.value=validSelection(data.selectedSynonym)
}

async function choose(word:string) {
  const id=recordId.value
  if(!id||saving.value||word===selected.value||!entries.value.some(e=>e.word===word))return
  const source=props.source
  const previous=selected.value
  const previousSelection=source?.selectedSynonym ?? null
  const requested=word===source?.word?null:word
  saving.value=true
  if(source)source.selectedSynonym=requested
  selected.value=word
  try {
    const {data}=await apiService.vocabulary.selectSynonym(id,requested)
    if(source)source.selectedSynonym=data.selectedSynonym
    store.updateVocabulary(id,{selectedSynonym:data.selectedSynonym})
    if(store.currentVocabulary?.id===id)store.currentVocabulary.selectedSynonym=data.selectedSynonym
    if(recordId.value===id)selected.value=validSelection(data.selectedSynonym)
    localSelections.dispatchEvent(new CustomEvent('selection',{detail:data}))
  } catch {
    if(source && source.selectedSynonym===requested)source.selectedSynonym=previousSelection
    if(recordId.value===id)selected.value=validSelection(source ? source.selectedSynonym : previous)
    showError(t('vocabulary.synonymSelectionFailed'))
  } finally {saving.value=false}
}
const onLocal=(event:Event)=>receive((event as CustomEvent).detail)
onMounted(()=>{localSelections.addEventListener('selection',onLocal);websocketService.on('vocabulary:synonym-selected',receive)})
onUnmounted(()=>{localSelections.removeEventListener('selection',onLocal);websocketService.off('vocabulary:synonym-selected',receive)})
const active=computed(()=>entries.value.find(item=>item.word===selected.value)??entries.value[0]??{word:'',pronunciation:'',partOfSpeech:undefined})
const options=computed(()=>entries.value.map(item=>({value:item.word,label:item.word})))
watch(()=>[recordId.value,props.source?.word,props.source?.selectedSynonym],()=>{if(!saving.value)selected.value=validSelection(props.source?.selectedSynonym)},{immediate:true})
watch(entries,items=>{if(!items.some(item=>item.word===selected.value))selected.value=items[0]?.word??''})
</script>
