import { onUnmounted } from "vue";

// One shared lock for every modal, each instance releases only its own lock.
// Locking the document element as well as the body hides the desktop page scrollbar.
let activeModals = 0;

export function useModalScrollLock() {
  let locked = false;

  const lockScroll = () => {
    if (locked) return;
    locked = true;
    if (activeModals++ === 0) {
      document.documentElement.classList.add("scroll-lock");
      document.body.classList.add("scroll-lock");
    }
  };

  const unlockScroll = () => {
    if (!locked) return;
    locked = false;
    activeModals = Math.max(0, activeModals - 1);
    if (activeModals === 0) {
      document.documentElement.classList.remove("scroll-lock");
      document.body.classList.remove("scroll-lock");
    }
  };

  onUnmounted(unlockScroll);

  return { lockScroll, unlockScroll };
}
