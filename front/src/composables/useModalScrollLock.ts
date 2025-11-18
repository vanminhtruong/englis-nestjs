import { onUnmounted } from 'vue'

// Một biến đếm để theo dõi số lượng modal đang mở
let activeModals = 0

export function useModalScrollLock() {
  const lockScroll = () => {
    if (activeModals === 0) {
      document.body.classList.add('scroll-lock')
    }
    activeModals++
  }

  const unlockScroll = () => {
    activeModals--
    if (activeModals === 0) {
      document.body.classList.remove('scroll-lock')
    }
  }

  onUnmounted(() => {
    // Đảm bảo rằng scroll được unlock nếu component bị hủy mà không đóng modal đúng cách
    if (activeModals > 0) {
        activeModals = 0; // Reset counter
        document.body.classList.remove('scroll-lock')
    }
  })

  return {
    lockScroll,
    unlockScroll,
  }
}
