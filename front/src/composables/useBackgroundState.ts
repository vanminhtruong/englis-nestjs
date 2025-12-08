import { ref, computed, watch, reactive } from 'vue'

const STORAGE_KEY_PREFIX = 'vocabulary_bg_'

// Global reactive state để lưu tất cả backgrounds theo key
const backgroundsMap = reactive<Record<string, string | null>>({})

// Load tất cả backgrounds từ localStorage khi khởi tạo
function loadAllBackgrounds() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            const id = key.replace(STORAGE_KEY_PREFIX, '')
            backgroundsMap[id] = localStorage.getItem(key)
        }
    }
}

// Load ngay khi module được import
loadAllBackgrounds()

/**
 * Hook để quản lý background cho từng item (date group, category, etc.)
 * @param itemId - ID duy nhất cho item (ví dụ: date string)
 */
export function useItemBackground(itemId: string) {
    const storageKey = `${STORAGE_KEY_PREFIX}${itemId}`

    // Initialize từ localStorage nếu chưa có trong map
    if (backgroundsMap[itemId] === undefined) {
        backgroundsMap[itemId] = localStorage.getItem(storageKey)
    }

    // Computed để lấy background URL
    const backgroundUrl = computed({
        get: (): string | null => backgroundsMap[itemId] ?? null,
        set: (val: string | null) => {
            backgroundsMap[itemId] = val
            if (val) {
                localStorage.setItem(storageKey, val)
            } else {
                localStorage.removeItem(storageKey)
            }
        }
    })

    // Computed CSS style for background
    const backgroundStyle = computed(() => {
        if (!backgroundsMap[itemId]) return {}
        return {
            backgroundImage: `url(${backgroundsMap[itemId]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }
    })

    // Check if has background
    const hasBackground = computed(() => !!backgroundsMap[itemId])

    // Set background
    const setBackground = (url: string | null) => {
        backgroundsMap[itemId] = url
        if (url) {
            localStorage.setItem(storageKey, url)
        } else {
            localStorage.removeItem(storageKey)
        }
    }

    // Clear background
    const clearBackground = () => {
        backgroundsMap[itemId] = null
        localStorage.removeItem(storageKey)
    }

    return {
        backgroundUrl,
        backgroundStyle,
        hasBackground,
        setBackground,
        clearBackground,
    }
}

// Export cũ để tương thích ngược (cho toàn trang)
export function useBackgroundState() {
    return useItemBackground('global')
}
