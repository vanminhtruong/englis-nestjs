export function useTagDetailHandle() {
    function getVideoThumbnail(url: string) {
        if (!url) return ''
        // YouTube
        const youtubeRegex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const youtubeMatch = url.match(youtubeRegex)
        if (youtubeMatch) {
            return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
        }
        return '' // Or a default placeholder
    }

    function handleSpeak(word: string) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word)
            utterance.lang = 'en-US' // Default to English, can be adjusted
            window.speechSynthesis.speak(utterance)
        }
    }

    return {
        getVideoThumbnail,
        handleSpeak,
    }
}
