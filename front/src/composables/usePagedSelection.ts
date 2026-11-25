import { computed, ref, type Ref } from 'vue'

export function usePagedSelection(items: Readonly<Ref<readonly { id: string }[]>>) {
  const selectedIds = ref<string[]>([])
  const selectedSet = computed(() => new Set(selectedIds.value))
  const isAllSelected = computed(() => items.value.length > 0 && items.value.every(item => selectedSet.value.has(item.id)))
  function toggleSelection(id: string) {
    selectedIds.value = selectedSet.value.has(id) ? selectedIds.value.filter(value => value !== id) : [...selectedIds.value, id]
  }
  function removeIds(ids: readonly string[]) {
    const removed = new Set(ids)
    selectedIds.value = selectedIds.value.filter(id => !removed.has(id))
  }
  function toggleSelectAll() {
    if (isAllSelected.value) removeIds(items.value.map(item => item.id))
    else selectedIds.value = [...new Set([...selectedIds.value, ...items.value.map(item => item.id)])]
  }
  function clearSelection() { selectedIds.value = [] }
  return { selectedIds, selectedSet, isAllSelected, toggleSelection, toggleSelectAll, clearSelection, removeIds }
}
