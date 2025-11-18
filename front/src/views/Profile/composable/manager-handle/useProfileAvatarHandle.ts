import { ref } from 'vue'
import type { Ref } from 'vue'

export function useProfileAvatarHandle(form: { avatar: string }) {
  const avatarFileInput: Ref<HTMLInputElement | null> = ref(null)

  const handleCopyAvatarUrl = async () => {
    if (!form.avatar) return
    try {
      await navigator.clipboard.writeText(form.avatar)
    } catch (error) {
      console.error('Failed to copy avatar URL:', error)
    }
  }

  const triggerAvatarFileInput = () => {
    if (avatarFileInput.value) {
      avatarFileInput.value.click()
    }
  }

  const handleAvatarFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      form.avatar = result
    }
    reader.readAsDataURL(file)
  }

  const handlePasteAvatarImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              form.avatar = result
            }
            reader.readAsDataURL(blob)
            return
          }
        }
      }
      console.warn('No image found in clipboard')
    } catch (error) {
      console.error('Failed to read clipboard for avatar image:', error)
    }
  }

  return {
    avatarFileInput,
    handleCopyAvatarUrl,
    triggerAvatarFileInput,
    handleAvatarFileChange,
    handlePasteAvatarImage,
  }
}
