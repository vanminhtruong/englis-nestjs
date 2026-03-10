import { ref } from 'vue'

export function useEditingDate() {
    const currentEditingDate = ref<string | null>(null)

    function setEditingDate(date: string, isEditing: boolean) {
        if (isEditing) {
            currentEditingDate.value = date
        } else if (currentEditingDate.value === date) {
            currentEditingDate.value = null
        }
    }

    return {
        currentEditingDate,
        setEditingDate,
    }
}
