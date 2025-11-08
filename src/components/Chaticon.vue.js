/// <reference types="C:/Users/kariu/Desktop/Latest_Pothole_spotter/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { RouterLink } from 'vue-router';
const isVisible = ref(true);
const isDragging = ref(false);
const isHovered = ref(false);
const buttonRef = ref(null);
const pressTimer = ref(null);
const dragPointerId = ref(null);
const dragOffset = reactive({ x: 0, y: 0 });
const position = reactive({ x: window.innerWidth - 100, y: 100 });
const particles = ref([]);
function clamp(v, a = 0, b = 0) {
    return Math.max(a, Math.min(v, b));
}
function createParticles() {
    particles.value = Array.from({ length: 4 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 18;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
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
        };
    });
}
function startPressTimer(e) {
    if (pressTimer.value)
        return;
    pressTimer.value = window.setTimeout(() => {
        isDragging.value = true;
        dragPointerId.value = e.pointerId;
        buttonRef.value?.setPointerCapture?.(e.pointerId);
        const rect = buttonRef.value.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
    }, 500);
}
function clearPressTimer() {
    if (pressTimer.value) {
        clearTimeout(pressTimer.value);
        pressTimer.value = null;
    }
}
function onPointerDown(e) {
    startPressTimer(e);
}
function onPointerMove(e) {
    if (!isDragging.value)
        return;
    if (dragPointerId.value !== null && e.pointerId !== dragPointerId.value)
        return;
    const w = buttonRef.value?.offsetWidth ?? 64;
    const h = buttonRef.value?.offsetHeight ?? 64;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    position.x = clamp(x, 8, window.innerWidth - w - 8);
    position.y = clamp(y, 8, window.innerHeight - h - 8);
}
function onPointerUp(e) {
    clearPressTimer();
    if (isDragging.value && dragPointerId.value !== null) {
        try {
            buttonRef.value?.releasePointerCapture?.(dragPointerId.value);
        }
        catch { }
    }
    isDragging.value = false;
    dragPointerId.value = null;
}
function onPointerLeave(e) {
    // clear long press when leaving
    clearPressTimer();
}
onMounted(() => {
    createParticles();
    window.addEventListener('resize', handleResize);
});
onBeforeUnmount(() => {
    clearPressTimer();
    window.removeEventListener('resize', handleResize);
});
function handleResize() {
    position.x = clamp(position.x, 8, window.innerWidth - (buttonRef.value?.offsetWidth ?? 64) - 8);
    position.y = clamp(position.y, 8, window.innerHeight - (buttonRef.value?.offsetHeight ?? 64) - 8);
}
const wrapperStyle = computed(() => ({
    left: `${position.x}px`,
    top: `${position.y}px`,
    touchAction: 'none',
    transition: isDragging.value ? 'none' : 'transform 0.15s ease',
}));
const orbStyle = computed(() => ({
    background: 'linear-gradient(135deg,#06b6d4,#2563eb)',
    boxShadow: isHovered.value
        ? '0 0 20px 6px rgba(56,182,255,0.35)'
        : '0 6px 18px rgba(8, 145, 178, 0.18)',
    transform: isDragging.value ? 'scale(1.06)' : isHovered.value ? 'scale(1.03) rotate(0deg)' : 'scale(1)',
    transition: 'transform 160ms linear, box-shadow 240ms linear'
}));
const pathStyle = computed(() => ({
    transition: 'stroke-dashoffset 0.5s ease',
    strokeDasharray: isHovered.value ? '100' : '80',
    strokeDashoffset: isHovered.value ? '0' : '20'
}));
const dotsStyle = computed(() => ({
    transition: 'opacity 0.4s ease',
    opacity: isHovered.value ? '1' : '0.8'
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['inner-glow']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.isVisible) {
    // @ts-ignore
    [isVisible,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onPointerdown: (__VLS_ctx.onPointerDown) },
        ...{ onPointerup: (__VLS_ctx.onPointerUp) },
        ...{ onPointercancel: (__VLS_ctx.onPointerUp) },
        ...{ onPointerleave: (__VLS_ctx.onPointerLeave) },
        ...{ onPointermove: (__VLS_ctx.onPointerMove) },
        ...{ onMouseenter: (() => (__VLS_ctx.isHovered = true)) },
        ...{ onMouseleave: (() => (__VLS_ctx.isHovered = false)) },
        ref: "buttonRef",
        ...{ class: "fixed z-50 touch-none cursor-pointer" },
        ...{ style: (__VLS_ctx.wrapperStyle) },
        'aria-label': ('Contact button'),
        role: "link",
    });
    /** @type {typeof __VLS_ctx.buttonRef} */ ;
    // @ts-ignore
    [onPointerDown, onPointerUp, onPointerUp, onPointerLeave, onPointerMove, isHovered, isHovered, wrapperStyle, buttonRef,];
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
    // @ts-ignore
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/contact",
        ...{ class: "block" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/contact",
        ...{ class: "block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_4 } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: (['relative flex items-center justify-center rounded-full', 'w-16 h-16', __VLS_ctx.isHovered ? 'hovered' : '', __VLS_ctx.isDragging ? 'dragging' : '']) },
        ...{ style: (__VLS_ctx.orbStyle) },
    });
    // @ts-ignore
    [isHovered, isDragging, orbStyle,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "inner-glow" },
        ...{ class: ({ 'hovered-glow': __VLS_ctx.isHovered }) },
    });
    // @ts-ignore
    [isHovered,];
    const __VLS_5 = {}.TransitionGroup;
    /** @type {[typeof __VLS_components.TransitionGroup, typeof __VLS_components.transitionGroup, typeof __VLS_components.TransitionGroup, typeof __VLS_components.transitionGroup, ]} */ ;
    // @ts-ignore
    TransitionGroup;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        name: "pulse",
        tag: "div",
    }));
    const __VLS_7 = __VLS_6({
        name: "pulse",
        tag: "div",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const { default: __VLS_9 } = __VLS_8.slots;
    if (__VLS_ctx.isHovered) {
        // @ts-ignore
        [isHovered,];
        __VLS_asFunctionalElement(__VLS_elements.div)({
            key: "ring1",
            ...{ class: "pulse-ring ring-1" },
        });
    }
    if (__VLS_ctx.isHovered) {
        // @ts-ignore
        [isHovered,];
        __VLS_asFunctionalElement(__VLS_elements.div)({
            key: "ring2",
            ...{ class: "pulse-ring ring-2" },
        });
    }
    var __VLS_8;
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        ...{ class: "w-8 h-8 relative z-10 message-icon" },
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "white",
        'stroke-width': "1.8",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        ...{ style: (__VLS_ctx.pathStyle) },
    });
    // @ts-ignore
    [pathStyle,];
    __VLS_asFunctionalElement(__VLS_elements.g, __VLS_elements.g)({
        ...{ style: (__VLS_ctx.dotsStyle) },
    });
    // @ts-ignore
    [dotsStyle,];
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "8",
        cy: "10",
        r: "0.8",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "12",
        cy: "10",
        r: "0.8",
    });
    __VLS_asFunctionalElement(__VLS_elements.circle)({
        cx: "16",
        cy: "10",
        r: "0.8",
    });
    if (__VLS_ctx.isHovered) {
        // @ts-ignore
        [isHovered,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "particles" },
        });
        for (const [p] of __VLS_getVForSourceType((__VLS_ctx.particles))) {
            // @ts-ignore
            [particles,];
            __VLS_asFunctionalElement(__VLS_elements.span)({
                key: (p.id),
                ...{ class: "particle" },
                ...{ style: (p.style) },
            });
        }
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['touch-none']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-16']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['inner-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['hovered-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-1']} */ ;
/** @type {__VLS_StyleScopedClasses['pulse-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['particles']} */ ;
/** @type {__VLS_StyleScopedClasses['particle']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        RouterLink: RouterLink,
        isVisible: isVisible,
        isDragging: isDragging,
        isHovered: isHovered,
        buttonRef: buttonRef,
        particles: particles,
        onPointerDown: onPointerDown,
        onPointerMove: onPointerMove,
        onPointerUp: onPointerUp,
        onPointerLeave: onPointerLeave,
        wrapperStyle: wrapperStyle,
        orbStyle: orbStyle,
        pathStyle: pathStyle,
        dotsStyle: dotsStyle,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
