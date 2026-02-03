import { useToast } from './useToast'

export function useAuthValidation() {
    const toast = useToast()

    const validateEmail = (email: string) => {
        if (!email) {
            toast.showError('Email is required')
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.showError('Invalid email format')
            return false
        }
        return true
    }

    const validatePassword = (password: string) => {
        if (!password) {
            toast.showError('Password is required')
            return false
        }
        if (password.length < 6) {
            toast.showError('Password must be at least 6 characters')
            return false
        }
        return true
    }

    const validateFullName = (fullName: string) => {
        if (!fullName) {
            toast.showError('Full name is required')
            return false
        }
        if (fullName.length < 2) {
            toast.showError('Full name must be at least 2 characters')
            return false
        }
        return true
    }

    const validateConfirmPassword = (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            toast.showError('Passwords do not match')
            return false
        }
        return true
    }

    const validateLogin = (form: { email: string; password: string }) => {
        if (!validateEmail(form.email)) return false
        if (!validatePassword(form.password)) return false
        return true
    }

    const validateRegister = (form: {
        fullName: string
        email: string
        password: string
        confirmPassword: string
    }) => {
        if (!validateFullName(form.fullName)) return false
        if (!validateEmail(form.email)) return false
        if (!validatePassword(form.password)) return false
        if (!validateConfirmPassword(form.password, form.confirmPassword)) return false
        return true
    }

    return {
        validateLogin,
        validateRegister,
    }
}
