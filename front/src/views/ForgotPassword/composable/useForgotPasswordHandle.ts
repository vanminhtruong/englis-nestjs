import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apiService from '../../../services/api.service';

export function useForgotPasswordHandle() {
  const { t } = useI18n();
  const step = ref<'email' | 'code' | 'success'>('email');
  const email = ref('');
  const code = ref('');
  const password = ref('');
  const confirmation = ref('');
  const showPassword = ref(false);
  const showConfirmation = ref(false);
  const submitting = ref(false);
  const error = ref('');
  const notice = ref('');
  const remainingSeconds = ref(0);
  const canResend = computed(() => remainingSeconds.value === 0 && !submitting.value);
  let countdown: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    countdown = setInterval(() => {
      if (remainingSeconds.value > 0) remainingSeconds.value -= 1;
    }, 1000);
  });
  onUnmounted(() => {
    if (countdown) clearInterval(countdown);
  });

  async function requestCode() {
    if (submitting.value) return;
    error.value = '';
    submitting.value = true;
    try {
      await apiService.auth.requestPasswordReset(email.value.trim());
      step.value = 'code';
      notice.value = t('forgotPassword.emailSent');
      remainingSeconds.value = 60;
    } catch {
      error.value = t('forgotPassword.sendFailed');
    } finally {
      submitting.value = false;
    }
  }

  async function resetPassword() {
    if (submitting.value) return;
    error.value = '';
    if (password.value.length < 8) {
      error.value = t('forgotPassword.passwordShort');
      return;
    }
    if (password.value !== confirmation.value) {
      error.value = t('forgotPassword.passwordMismatch');
      return;
    }
    submitting.value = true;
    try {
      await apiService.auth.resetPassword({
        email: email.value.trim(), code: code.value, password: password.value,
      });
      password.value = '';
      confirmation.value = '';
      code.value = '';
      notice.value = '';
      step.value = 'success';
    } catch (response: unknown) {
      const status = (response as { response?: { status?: number } })?.response?.status;
      error.value = status === 400
        ? t('forgotPassword.codeInvalid')
        : t('forgotPassword.resetFailed');
    } finally {
      submitting.value = false;
    }
  }

  function changeEmail() {
    step.value = 'email';
    code.value = '';
    password.value = '';
    confirmation.value = '';
    notice.value = '';
    error.value = '';
  }

  return {
    t, step, email, code, password, confirmation, showPassword,
    showConfirmation, submitting, error, notice, remainingSeconds, canResend,
    requestCode, resetPassword, changeEmail,
  };
}
