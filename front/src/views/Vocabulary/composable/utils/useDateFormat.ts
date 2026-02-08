import { type Ref } from 'vue'

const localeMap: Record<string, string> = {
    en: 'en-US',
    vi: 'vi-VN',
    ko: 'ko-KR',
    'zh-CN': 'zh-CN',
}

export function useDateFormat(locale: Ref<string>) {
    function formatDate(dateString: string): string {
        const date = new Date(dateString)
        return date.toLocaleDateString(localeMap[locale.value] || 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    function formatDateTime(dateString: string): string {
        const date = new Date(dateString)
        return date.toLocaleString(localeMap[locale.value] || 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    function formatRelativeTime(dateString: string): string {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

        return formatDate(dateString)
    }

    return {
        formatDate,
        formatDateTime,
        formatRelativeTime,
    }
}
