import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Ref } from 'vue'

export function useCubeAnimation(containerRef: Ref<HTMLElement | null>) {
    // The continuous rotation angle (Y-axis)
    const autoRotationY = ref(0)

    // The interactive tilt/rotation from mouse (X and Y axes)
    const mouseTilt = ref({ x: 0, y: 0 })
    const targetTilt = ref({ x: 0, y: 0 })

    const isHovering = ref(false)
    let animationFrame: number
    let lastTime = 0

    const handleMouseMove = (event: MouseEvent) => {
        if (!containerRef.value) return

        const rect = containerRef.value.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const mouseX = event.clientX - centerX
        const mouseY = event.clientY - centerY

        // Calculate target tilt based on mouse position
        // X controls rotation around Y axis (left/right)
        // Y controls rotation around X axis (up/down)
        targetTilt.value = {
            x: -mouseY * 0.2, // Tilt up/down
            y: mouseX * 0.2   // Rotate left/right
        }
    }

    const handleMouseEnter = () => {
        isHovering.value = true
    }

    const handleMouseLeave = () => {
        isHovering.value = false
        targetTilt.value = { x: 0, y: 0 }
    }

    const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor
    }

    const animate = (currentTime: number) => {
        if (!lastTime) lastTime = currentTime
        const deltaTime = (currentTime - lastTime) / 16.67 // Normalize to ~60fps
        lastTime = currentTime

        // Smoothly interpolate current tilt towards target tilt
        const smoothFactor = 0.1 * deltaTime
        mouseTilt.value.x = lerp(mouseTilt.value.x, targetTilt.value.x, smoothFactor)
        mouseTilt.value.y = lerp(mouseTilt.value.y, targetTilt.value.y, smoothFactor)

        // Auto-rotation logic
        // We continue auto-rotation slowly even when hovering, or pause it?
        // Pausing it feels more "interactive" like you caught the object.
        if (!isHovering.value) {
            autoRotationY.value = (autoRotationY.value + 0.5 * deltaTime) % 360
        }

        animationFrame = requestAnimationFrame(animate)
    }

    onMounted(() => {
        animationFrame = requestAnimationFrame(animate)
        if (containerRef.value) {
            containerRef.value.addEventListener('mousemove', handleMouseMove)
            containerRef.value.addEventListener('mouseenter', handleMouseEnter)
            containerRef.value.addEventListener('mouseleave', handleMouseLeave)
        }
    })

    onUnmounted(() => {
        cancelAnimationFrame(animationFrame)
        if (containerRef.value) {
            containerRef.value.removeEventListener('mousemove', handleMouseMove)
            containerRef.value.removeEventListener('mouseenter', handleMouseEnter)
            containerRef.value.removeEventListener('mouseleave', handleMouseLeave)
        }
    })

    const cubeStyle = computed(() => {
        // Base tilt of 15deg on X axis for better 3D view
        // Add mouse tilt on top
        const currentX = 15 + mouseTilt.value.x

        // Auto rotation + mouse tilt on Y axis
        const currentY = autoRotationY.value + mouseTilt.value.y

        return {
            transform: `rotateX(${currentX}deg) rotateY(${currentY}deg)`
        }
    })

    return {
        cubeStyle,
        isHovering
    }
}
