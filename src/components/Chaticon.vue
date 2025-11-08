<template>
  <div
    v-if="isVisible"
    ref="buttonRef"
    class="fixed z-50 touch-none cursor-pointer"
    :style="wrapperStyle"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerLeave"
    @pointermove="onPointerMove"
    @mouseenter="() => (isHovered = true)"
    @mouseleave="() => (isHovered = false)"
    :aria-label="'Contact button'"
    role="link"
  >
    <RouterLink to="/contact" class="block">
      <div
        :class="['relative flex items-center justify-center rounded-full', 'w-16 h-16', isHovered ? 'hovered' : '', isDragging ? 'dragging' : '']"
        :style="orbStyle"
      >
        <div class="inner-glow" :class="{ 'hovered-glow': isHovered }"></div>

        <transition-group name="pulse" tag="div">
          <div
            v-if="isHovered"
            key="ring1"
            class="pulse-ring ring-1"
          />
          <div
            v-if="isHovered"
            key="ring2"
            class="pulse-ring ring-2"
          />
        </transition-group>

        <svg class="w-8 h-8 relative z-10 message-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" :style="pathStyle" />
          <g :style="dotsStyle">
            <circle cx="8" cy="10" r="0.8" />
            <circle cx="12" cy="10" r="0.8" />
            <circle cx="16" cy="10" r="0.8" />
          </g>
        </svg>

        <div v-if="isHovered" class="particles">
          <span
            v-for="p in particles"
            :key="p.id"
            class="particle"
            :style="p.style"
          />
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink } from 'vue-router'

const isVisible = ref(true)
const isDragging = ref(false)
const isHovered = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const pressTimer = ref<number | null>(null)
const dragPointerId = ref<number | null>(null)
const dragOffset = reactive({ x: 0, y: 0 })

const position = reactive({ x: window.innerWidth - 100, y: 100 })
const particles = ref<{ id: number; style: Record<string, string> }[]>([])

function clamp(v: number, a = 0, b = 0) {
  return Math.max(a, Math.min(v, b))
}

function createParticles() {
  particles.value = Array.from({ length: 4 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2
    const dist = 12 + Math.random() * 18
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    return {
      id: i,
      style: {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%,-50%)',
        width: '0.4rem',
        height: '0.4rem',
        borderRadius: '9999px',
        background: 'rgba(255,255,255,0.95)',
        position: 'absolute',
        animation: `particle-move 2s ${i * 0.2}s infinite`,
        '--tx': `${tx}px`,
        '--ty': `${ty}px`
      }
    }
  })
}

function startPressTimer(e: PointerEvent) {
  if (pressTimer.value) return
  pressTimer.value = window.setTimeout(() => {
    isDragging.value = true
    dragPointerId.value = e.pointerId
    buttonRef.value?.setPointerCapture?.(e.pointerId)
    const rect = buttonRef.value!.getBoundingClientRect()
    dragOffset.x = e.clientX - rect.left
    dragOffset.y = e.clientY - rect.top
  }, 500)
}

function clearPressTimer() {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value)
    pressTimer.value = null
  }
}

function onPointerDown(e: PointerEvent) {
  startPressTimer(e)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  if (dragPointerId.value !== null && e.pointerId !== dragPointerId.value) return
  const w = buttonRef.value?.offsetWidth ?? 64
  const h = buttonRef.value?.offsetHeight ?? 64
  const x = e.clientX - dragOffset.x
  const y = e.clientY - dragOffset.y
  position.x = clamp(x, 8, window.innerWidth - w - 8)
  position.y = clamp(y, 8, window.innerHeight - h - 8)
}

function onPointerUp(e: PointerEvent) {
  clearPressTimer()
  if (isDragging.value && dragPointerId.value !== null) {
    try {
      buttonRef.value?.releasePointerCapture?.(dragPointerId.value)
    } catch {}
  }
  isDragging.value = false
  dragPointerId.value = null
}

function onPointerLeave(e: PointerEvent) {
  // clear long press when leaving
  clearPressTimer()
}

onMounted(() => {
  createParticles()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearPressTimer()
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  position.x = clamp(position.x, 8, window.innerWidth - (buttonRef.value?.offsetWidth ?? 64) - 8)
  position.y = clamp(position.y, 8, window.innerHeight - (buttonRef.value?.offsetHeight ?? 64) - 8)
}

const wrapperStyle = computed(() => ({
  left: `${position.x}px`,
  top: `${position.y}px`,
  touchAction: 'none',
  transition: isDragging.value ? 'none' : 'transform 0.15s ease',
}))

const orbStyle = computed(() => ({
  background: 'linear-gradient(135deg,#06b6d4,#2563eb)',
  boxShadow: isHovered.value
    ? '0 0 20px 6px rgba(56,182,255,0.35)'
    : '0 6px 18px rgba(8, 145, 178, 0.18)',
  transform: isDragging.value ? 'scale(1.06)' : isHovered.value ? 'scale(1.03) rotate(0deg)' : 'scale(1)',
  transition: 'transform 160ms linear, box-shadow 240ms linear'
}))

const pathStyle = computed(() => ({
  transition: 'stroke-dashoffset 0.5s ease',
  strokeDasharray: isHovered.value ? '100' : '80',
  strokeDashoffset: isHovered.value ? '0' : '20'
}))

const dotsStyle = computed(() => ({
  transition: 'opacity 0.4s ease',
  opacity: isHovered.value ? '1' : '0.8'
}))
</script>

<style scoped>
.touch-none {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: none;
}

.w-16 { width: 4rem; }
.h-16 { height: 4rem; }

.inner-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgba(6, 182, 212, 0.18);
  opacity: 1;
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.inner-glow.hovered-glow {
  transform: scale(1.15);
  opacity: 0.95;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgba(99, 102, 241, 0.22);
  top: 0;
  left: 0;
}
.ring-1 { animation: pulse-ring 2s ease-out infinite; }
.ring-2 { animation: pulse-ring 2s ease-out infinite 0.5s; }

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  70% { transform: scale(1.6); opacity: 0; }
  100% { opacity: 0; }
}

.message-icon { pointer-events: none; }

.particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
}
@keyframes particle-move {
  0% { transform: translate(-50%,-50%) translate(0px,0px); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty)); opacity: 0; }
}

.hovered { animation: rotate-tilt 1.5s linear infinite; }
@keyframes rotate-tilt {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(12deg); }
  50% { transform: rotate(-12deg); }
  100% { transform: rotate(0deg); }
}

.dragging { transform: scale(1.06) !important; }

.pulse-enter-from, .pulse-leave-to { opacity: 0; transform: scale(0.8); }
.pulse-enter-active, .pulse-leave-active { transition: all 0.5s ease; }

/* small accessibility focus */
:focus-visible { outline: 2px solid rgba(99,102,241,0.4); outline-offset: 2px; border-radius: 9999px; }
</style>
