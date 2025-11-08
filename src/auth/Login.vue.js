import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { END_POINTS, BACKEND_URL } from '../utils/index.js';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/userStore';
import google_logo from "../assets/google-logo.png";
import { NButton, NInput, NCheckbox } from 'naive-ui';
import { Road as FaRoad, Car as FaCar, TrafficLight as FaTrafficLight, MapMarkedAlt as FaMapMarkedAlt } from '@vicons/fa';
const userStore = useUserStore();
const router = useRouter();
const year = new Date().getFullYear();
const loginMethod = ref('email');
const email = ref('');
const phone = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const error = ref('');
const success = ref('');
const formErrors = reactive({
    email: '',
    phone: '',
    password: ''
});
const particles = ref([]);
onMounted(() => {
    const arr = Array.from({ length: 20 }, (_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const scale = Math.random() * 0.5 + 0.5;
        return {
            id: i,
            style: {
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                transform: `scale(${scale})`
            }
        };
    });
    particles.value = arr;
});
function validateForm() {
    let valid = true;
    formErrors.email = '';
    formErrors.phone = '';
    formErrors.password = '';
    if (loginMethod.value === 'email') {
        if (!email.value) {
            formErrors.email = 'Email is required';
            valid = false;
        }
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.value)) {
            formErrors.email = 'Invalid email address';
            valid = false;
        }
    }
    else {
        if (!phone.value) {
            formErrors.phone = 'Phone number is required';
            valid = false;
        }
        else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(phone.value)) {
            formErrors.phone = 'Invalid phone number';
            valid = false;
        }
    }
    if (!password.value) {
        formErrors.password = 'Password is required';
        valid = false;
    }
    else if (password.value.length < 6) {
        formErrors.password = 'Password must be at least 6 characters';
        valid = false;
    }
    return valid;
}
async function handleSubmit() {
    error.value = '';
    success.value = '';
    if (!validateForm()) {
        console.warn('Validation failed:', { ...formErrors });
        return;
    }
    isLoading.value = true;
    try {
        const payload = loginMethod.value === 'email'
            ? { identifier: email.value, password: password.value }
            : { identifier: phone.value, password: password.value };
        const res = await axios.post(END_POINTS.LOGIN, payload, { timeout: 15000 });
        if (res?.data?.token) {
            userStore.setUser(res.data.user);
            userStore.setToken(res.data.token);
            success.value = 'Login successful';
            setTimeout(() => router.push('/'), 300);
        }
        else {
            console.warn('[login] no token returned', res.data);
            success.value = 'Login succeeded (no token returned)';
            router.push('/');
        }
    }
    catch (err) {
        console.error('[login] error', err);
        if (err?.response) {
            error.value =
                err.response.data?.message || `Server error (${err.response.status})`;
        }
        else if (err?.request) {
            error.value = 'No response from server. Check your internet connection!';
        }
        else {
            error.value = err.message || 'Login failed. Please try again.';
        }
    }
    finally {
        isLoading.value = false;
    }
}
function toggleLoginMethod() {
    loginMethod.value = loginMethod.value === 'email' ? 'phone' : 'email';
    error.value = '';
    formErrors.email = '';
    formErrors.phone = '';
    formErrors.password = '';
}
function signInWithGoogle() {
    window.location.href = `${BACKEND_URL}/auth/google`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex items-center justify-center py-16 p-4 relative overflow-hidden" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 pointer-events-none" },
});
const __VLS_0 = {}.FaRoad;
/** @type {[typeof __VLS_components.FaRoad, ]} */ ;
// @ts-ignore
FaRoad;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = {}.FaCar;
/** @type {[typeof __VLS_components.FaCar, ]} */ ;
// @ts-ignore
FaCar;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = {}.FaTrafficLight;
/** @type {[typeof __VLS_components.FaTrafficLight, ]} */ ;
// @ts-ignore
FaTrafficLight;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    ...{ class: "absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" },
}));
const __VLS_12 = __VLS_11({
    ...{ class: "absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_15 = {}.FaMapMarkedAlt;
/** @type {[typeof __VLS_components.FaMapMarkedAlt, ]} */ ;
// @ts-ignore
FaMapMarkedAlt;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    ...{ class: "absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" },
}));
const __VLS_17 = __VLS_16({
    ...{ class: "absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 pointer-events-none" },
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.particles))) {
    // @ts-ignore
    [particles,];
    __VLS_asFunctionalElement(__VLS_elements.div)({
        key: (p.id),
        ...{ class: "absolute w-1 h-1 bg-amber-500 bg-opacity-50 rounded-full animate-particle-float" },
        ...{ style: (p.style) },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-transform duration-300 hover:-translate-y-1" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-black/80 to-gray-900/80" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-3xl font-bold text-amber-500 mb-2" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-gray-300 mb-6" },
});
if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 rounded-md px-4 py-3 bg-red-600 text-white" },
    });
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
}
if (__VLS_ctx.success) {
    // @ts-ignore
    [success,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 rounded-md px-4 py-3 bg-green-600 text-white" },
    });
    (__VLS_ctx.success);
    // @ts-ignore
    [success,];
}
__VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
    ...{ onSubmit: (__VLS_ctx.handleSubmit) },
    ...{ class: "flex flex-col gap-6" },
    novalidate: true,
});
// @ts-ignore
[handleSubmit,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleLoginMethod) },
    type: "button",
    ...{ class: "text-sm border border-gray-400 px-3 py-1 rounded-2xl text-amber-500 hover:bg-gray-700/40 transition-colors" },
});
// @ts-ignore
[toggleLoginMethod,];
(__VLS_ctx.loginMethod === 'email' ? 'Use phone instead' : 'Use email instead');
// @ts-ignore
[loginMethod,];
if (__VLS_ctx.loginMethod === 'email') {
    // @ts-ignore
    [loginMethod,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm font-medium text-gray-300" },
    });
    const __VLS_20 = {}.NInput;
    /** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
    // @ts-ignore
    NInput;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        value: (__VLS_ctx.email),
        placeholder: "you@example.com",
        type: "text",
        status: (__VLS_ctx.formErrors.email ? 'error' : undefined),
    }));
    const __VLS_22 = __VLS_21({
        value: (__VLS_ctx.email),
        placeholder: "you@example.com",
        type: "text",
        status: (__VLS_ctx.formErrors.email ? 'error' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    // @ts-ignore
    [email, formErrors,];
    if (__VLS_ctx.formErrors.email) {
        // @ts-ignore
        [formErrors,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
            ...{ class: "text-red-400" },
        });
        (__VLS_ctx.formErrors.email);
        // @ts-ignore
        [formErrors,];
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "text-sm font-medium text-gray-300" },
    });
    const __VLS_25 = {}.NInput;
    /** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
    // @ts-ignore
    NInput;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        value: (__VLS_ctx.phone),
        type: "text",
        inputmode: "tel",
        placeholder: "+1234567890",
        status: (__VLS_ctx.formErrors.phone ? 'error' : undefined),
    }));
    const __VLS_27 = __VLS_26({
        value: (__VLS_ctx.phone),
        type: "text",
        inputmode: "tel",
        placeholder: "+1234567890",
        status: (__VLS_ctx.formErrors.phone ? 'error' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    // @ts-ignore
    [formErrors, phone,];
    if (__VLS_ctx.formErrors.phone) {
        // @ts-ignore
        [formErrors,];
        __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
            ...{ class: "text-red-400" },
        });
        (__VLS_ctx.formErrors.phone);
        // @ts-ignore
        [formErrors,];
    }
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "text-sm font-medium text-gray-300" },
});
const __VLS_30 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    value: (__VLS_ctx.password),
    type: "password",
    placeholder: "••••••••",
    status: (__VLS_ctx.formErrors.password ? 'error' : undefined),
    showPassword: true,
}));
const __VLS_32 = __VLS_31({
    value: (__VLS_ctx.password),
    type: "password",
    placeholder: "••••••••",
    status: (__VLS_ctx.formErrors.password ? 'error' : undefined),
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[formErrors, password,];
if (__VLS_ctx.formErrors.password) {
    // @ts-ignore
    [formErrors,];
    __VLS_asFunctionalElement(__VLS_elements.small, __VLS_elements.small)({
        ...{ class: "text-red-400" },
    });
    (__VLS_ctx.formErrors.password);
    // @ts-ignore
    [formErrors,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-2" },
});
const __VLS_35 = {}.NCheckbox;
/** @type {[typeof __VLS_components.NCheckbox, typeof __VLS_components.nCheckbox, ]} */ ;
// @ts-ignore
NCheckbox;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    checked: (__VLS_ctx.rememberMe),
}));
const __VLS_37 = __VLS_36({
    checked: (__VLS_ctx.rememberMe),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
// @ts-ignore
[rememberMe,];
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "text-sm text-gray-300" },
});
const __VLS_40 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    to: "/auth/reset-password",
    ...{ class: "text-sm text-amber-500 hover:text-amber-400" },
}));
const __VLS_42 = __VLS_41({
    to: "/auth/reset-password",
    ...{ class: "text-sm text-amber-500 hover:text-amber-400" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_44 } = __VLS_43.slots;
var __VLS_43;
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    type: "submit",
    disabled: (__VLS_ctx.isLoading),
    ...{ class: "w-full rounded-md px-4 py-3 bg-amber-600 text-white font-semibold disabled:opacity-50" },
});
// @ts-ignore
[isLoading,];
if (!__VLS_ctx.isLoading) {
    // @ts-ignore
    [isLoading,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
else {
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative my-6" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-x-0 top-1/2 h-px bg-gray-700/30" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative inline-flex justify-center px-2 bg-white dark:bg-gray-800 text-sm text-gray-400" },
});
const __VLS_45 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onClick': {} },
    type: "default",
    block: true,
    ...{ class: "flex items-center justify-center gap-2 text-white" },
}));
const __VLS_47 = __VLS_46({
    ...{ 'onClick': {} },
    type: "default",
    block: true,
    ...{ class: "flex items-center justify-center gap-2 text-white" },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
const __VLS_51 = ({ click: {} },
    { onClick: (__VLS_ctx.signInWithGoogle) });
const { default: __VLS_52 } = __VLS_48.slots;
// @ts-ignore
[signInWithGoogle,];
const __VLS_53 = {}.NImage;
/** @type {[typeof __VLS_components.NImage, typeof __VLS_components.nImage, ]} */ ;
// @ts-ignore
NImage;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    width: "40",
    src: (__VLS_ctx.google_logo),
}));
const __VLS_55 = __VLS_54({
    width: "40",
    src: (__VLS_ctx.google_logo),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
// @ts-ignore
[google_logo,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
var __VLS_48;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mt-6 text-center text-sm text-gray-400" },
});
const __VLS_58 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    to: "/auth/signup",
    ...{ class: "font-medium text-amber-500 hover:text-amber-400" },
}));
const __VLS_60 = __VLS_59({
    to: "/auth/signup",
    ...{ class: "font-medium text-amber-500 hover:text-amber-400" },
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const { default: __VLS_62 } = __VLS_61.slots;
var __VLS_61;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-amber-700 to-amber-900 text-gray-900 dark:text-gray-900 flex items-center" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-md mx-auto" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-4xl font-extrabold mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-2xl font-semibold mb-6" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "mb-6" },
});
__VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
    ...{ class: "flex flex-col gap-3 mb-8" },
});
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
    ...{ class: "flex items-start gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" },
    viewBox: "0 0 20 20",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'fill-rule': "evenodd",
    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    'clip-rule': "evenodd",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
    ...{ class: "flex items-start gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" },
    viewBox: "0 0 20 20",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'fill-rule': "evenodd",
    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    'clip-rule': "evenodd",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
    ...{ class: "flex items-start gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
    ...{ class: "w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" },
    viewBox: "0 0 20 20",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_elements.path)({
    'fill-rule': "evenodd",
    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
    'clip-rule': "evenodd",
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-black/10 p-4 rounded-lg" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-sm italic mb-2" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-sm font-medium" },
});
(__VLS_ctx.year);
// @ts-ignore
[year,];
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-16']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[20%]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[5%]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-1']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[60%]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[80%]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-2']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[30%]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[85%]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-3']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[80%]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-[10%]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-float-4']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-particle-float']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:-translate-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-12']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-black/80']} */ ;
/** @type {__VLS_StyleScopedClasses['to-gray-900/80']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-700/40']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['my-6']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-x-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-700/30']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-12']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-br']} */ ;
/** @type {__VLS_StyleScopedClasses['from-amber-700']} */ ;
/** @type {__VLS_StyleScopedClasses['to-amber-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black/10']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['italic']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        google_logo: google_logo,
        NButton: NButton,
        NInput: NInput,
        NCheckbox: NCheckbox,
        FaRoad: FaRoad,
        FaCar: FaCar,
        FaTrafficLight: FaTrafficLight,
        FaMapMarkedAlt: FaMapMarkedAlt,
        year: year,
        loginMethod: loginMethod,
        email: email,
        phone: phone,
        password: password,
        rememberMe: rememberMe,
        isLoading: isLoading,
        error: error,
        success: success,
        formErrors: formErrors,
        particles: particles,
        handleSubmit: handleSubmit,
        toggleLoginMethod: toggleLoginMethod,
        signInWithGoogle: signInWithGoogle,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
