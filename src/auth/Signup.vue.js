import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import { NForm, NFormItem, NInput, NButton, NSelect, useMessage } from 'naive-ui';
import { Road as FaRoad, Car as FaCar, TrafficLight as FaTrafficLight, MapMarkedAlt as FaMapMarkedAlt } from '@vicons/fa';
import { countries, END_POINTS, BACKEND_URL } from '@/utils/index.js';
import { useUserStore } from '../store/userStore';
import google_logo from "../assets/google-logo.png";
const userStore = useUserStore();
const router = useRouter();
const year = new Date().getFullYear();
const messageApi = useMessage();
const formRef = ref(null);
const formValue = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: null,
    acceptTerms: true
});
const rules = {
    firstName: [{ required: true, message: 'First name is required', trigger: 'blur' }],
    lastName: [{ required: true, message: 'Last name is required', trigger: 'blur' }],
    email: [
        { required: true, message: 'Email is required', trigger: 'blur' },
        { type: 'email', message: 'Invalid email format', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Password is required', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
    ],
    confirmPassword: [
        {
            validator(rule, value) {
                return value === formValue.value.password;
            },
            message: 'Passwords do not match',
            trigger: 'blur'
        }
    ],
    phone: [{ required: true, message: 'Phone number is required', trigger: 'blur' }],
    country: [{ required: true, message: 'Country is required', trigger: 'change' }],
    acceptTerms: [
        {
            validator(rule, value) {
                return value === true;
            },
            message: 'You must accept the terms',
            trigger: 'change'
        }
    ]
};
const countryOptions = countries.map((c) => ({ label: c.name, value: c.code }));
const isLoading = ref(false);
const error = ref('');
const response_message = ref("");
async function handleSubmit() {
    error.value = '';
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            isLoading.value = true;
            try {
                const payload = { ...formValue.value };
                const res = await axios.post(END_POINTS.SIGNUP, payload, { timeout: 15000 });
                if (res?.data?.token) {
                    userStore.setUser(res.data.user);
                    userStore.setToken(res.data.token);
                    response_message.value = 'Account created successfully';
                    messageApi.success("Account created successfully for,", res.data.user.email);
                    setTimeout(() => router.push('/'), 300);
                }
                else {
                    response_message.value = 'An error occurred,Kindly try crating account later! or try loggin in!';
                    messageApi.error('An error occurred,Kindly try again!');
                }
            }
            catch (err) {
                error.value = err?.message || 'Registration failed. Please try again.';
                messageApi.error('Registration failed. Please try again.');
            }
            finally {
                isLoading.value = false;
            }
        }
    });
}
function signUpWithGoogle() {
    window.location.href = `${BACKEND_URL}/auth/google`;
}
function particleStyle(n) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 5;
    const scale = Math.random() * 0.5 + 0.5;
    return { left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s`, transform: `scale(${scale})` };
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
const __VLS_0 = ((__VLS_ctx.FaRoad));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
// @ts-ignore
[FaRoad,];
const __VLS_5 = ((__VLS_ctx.FaCar));
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[FaCar,];
const __VLS_10 = ((__VLS_ctx.FaTrafficLight));
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    ...{ class: "absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" },
}));
const __VLS_12 = __VLS_11({
    ...{ class: "absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
// @ts-ignore
[FaTrafficLight,];
const __VLS_15 = ((__VLS_ctx.FaMapMarkedAlt));
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    ...{ class: "absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" },
}));
const __VLS_17 = __VLS_16({
    ...{ class: "absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
// @ts-ignore
[FaMapMarkedAlt,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute w-48 h-48 bottom-[-50px] right-[-50px] opacity-5" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute w-36 h-36 rounded-full bg-gray-800 animate-pothole-pulse" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute w-32 h-32 rounded-full bg-amber-500 top-1 left-1 animate-pothole-fill" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 pointer-events-none" },
});
for (const [n] of __VLS_getVForSourceType((20))) {
    __VLS_asFunctionalElement(__VLS_elements.div)({
        key: (n),
        ...{ class: "absolute w-1 h-1 bg-amber-500 bg-opacity-50 rounded-full animate-particle-float" },
        ...{ style: (__VLS_ctx.particleStyle(n)) },
    });
    // @ts-ignore
    [particleStyle,];
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
const __VLS_20 = {}.NForm;
/** @type {[typeof __VLS_components.NForm, typeof __VLS_components.nForm, typeof __VLS_components.NForm, typeof __VLS_components.nForm, ]} */ ;
// @ts-ignore
NForm;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ref: "formRef",
    model: (__VLS_ctx.formValue),
    rules: (__VLS_ctx.rules),
    labelPlacement: "top",
}));
const __VLS_22 = __VLS_21({
    ref: "formRef",
    model: (__VLS_ctx.formValue),
    rules: (__VLS_ctx.rules),
    labelPlacement: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_24 = {};
const { default: __VLS_26 } = __VLS_23.slots;
// @ts-ignore
[formValue, rules, formRef,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
});
const __VLS_27 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    label: "First Name",
    path: "firstName",
}));
const __VLS_29 = __VLS_28({
    label: "First Name",
    path: "firstName",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const { default: __VLS_31 } = __VLS_30.slots;
const __VLS_32 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    value: (__VLS_ctx.formValue.firstName),
    placeholder: "John",
}));
const __VLS_34 = __VLS_33({
    value: (__VLS_ctx.formValue.firstName),
    placeholder: "John",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
// @ts-ignore
[formValue,];
var __VLS_30;
const __VLS_37 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    label: "Last Name",
    path: "lastName",
}));
const __VLS_39 = __VLS_38({
    label: "Last Name",
    path: "lastName",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_41 } = __VLS_40.slots;
const __VLS_42 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    value: (__VLS_ctx.formValue.lastName),
    placeholder: "Doe",
}));
const __VLS_44 = __VLS_43({
    value: (__VLS_ctx.formValue.lastName),
    placeholder: "Doe",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
// @ts-ignore
[formValue,];
var __VLS_40;
const __VLS_47 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    label: "Email Address",
    path: "email",
}));
const __VLS_49 = __VLS_48({
    label: "Email Address",
    path: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
const { default: __VLS_51 } = __VLS_50.slots;
const __VLS_52 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    value: (__VLS_ctx.formValue.email),
    type: "email",
    placeholder: "you@example.com",
}));
const __VLS_54 = __VLS_53({
    value: (__VLS_ctx.formValue.email),
    type: "email",
    placeholder: "you@example.com",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
// @ts-ignore
[formValue,];
var __VLS_50;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
});
const __VLS_57 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
    label: "Phone Number",
    path: "phone",
}));
const __VLS_59 = __VLS_58({
    label: "Phone Number",
    path: "phone",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const { default: __VLS_61 } = __VLS_60.slots;
const __VLS_62 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    value: (__VLS_ctx.formValue.phone),
    type: "tel",
    placeholder: "+1234567890",
}));
const __VLS_64 = __VLS_63({
    value: (__VLS_ctx.formValue.phone),
    type: "tel",
    placeholder: "+1234567890",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
// @ts-ignore
[formValue,];
var __VLS_60;
const __VLS_67 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    label: "Country",
    path: "country",
}));
const __VLS_69 = __VLS_68({
    label: "Country",
    path: "country",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_71 } = __VLS_70.slots;
const __VLS_72 = {}.NSelect;
/** @type {[typeof __VLS_components.NSelect, typeof __VLS_components.nSelect, ]} */ ;
// @ts-ignore
NSelect;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: (__VLS_ctx.formValue.country),
    options: (__VLS_ctx.countryOptions),
    placeholder: "Select country",
    filterable: true,
}));
const __VLS_74 = __VLS_73({
    value: (__VLS_ctx.formValue.country),
    options: (__VLS_ctx.countryOptions),
    placeholder: "Select country",
    filterable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
// @ts-ignore
[formValue, countryOptions,];
var __VLS_70;
const __VLS_77 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
    label: "Password",
    path: "password",
}));
const __VLS_79 = __VLS_78({
    label: "Password",
    path: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const { default: __VLS_81 } = __VLS_80.slots;
const __VLS_82 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    value: (__VLS_ctx.formValue.password),
    type: "password",
    placeholder: "••••••••",
    showPassword: true,
}));
const __VLS_84 = __VLS_83({
    value: (__VLS_ctx.formValue.password),
    type: "password",
    placeholder: "••••••••",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
// @ts-ignore
[formValue,];
var __VLS_80;
const __VLS_87 = {}.NFormItem;
/** @type {[typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, typeof __VLS_components.NFormItem, typeof __VLS_components.nFormItem, ]} */ ;
// @ts-ignore
NFormItem;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    label: "Confirm Password",
    path: "confirmPassword",
}));
const __VLS_89 = __VLS_88({
    label: "Confirm Password",
    path: "confirmPassword",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
const { default: __VLS_91 } = __VLS_90.slots;
const __VLS_92 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    value: (__VLS_ctx.formValue.confirmPassword),
    type: "password",
    placeholder: "••••••••",
    showPassword: true,
}));
const __VLS_94 = __VLS_93({
    value: (__VLS_ctx.formValue.confirmPassword),
    type: "password",
    placeholder: "••••••••",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
// @ts-ignore
[formValue,];
var __VLS_90;
const __VLS_97 = {}.NAlert;
/** @type {[typeof __VLS_components.NAlert, typeof __VLS_components.nAlert, typeof __VLS_components.NAlert, typeof __VLS_components.nAlert, ]} */ ;
// @ts-ignore
NAlert;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    title: "",
    type: "info",
}));
const __VLS_99 = __VLS_98({
    title: "",
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
const { default: __VLS_101 } = __VLS_100.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mt-4 text-sm text-gray-300" },
});
__VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
    href: "/terms",
    ...{ class: "text-amber-500 hover:underline" },
});
var __VLS_100;
const __VLS_102 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.isLoading),
    type: "primary",
    block: true,
}));
const __VLS_104 = __VLS_103({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.isLoading),
    type: "primary",
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
let __VLS_106;
let __VLS_107;
const __VLS_108 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSubmit) });
const { default: __VLS_109 } = __VLS_105.slots;
// @ts-ignore
[isLoading, handleSubmit,];
var __VLS_105;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative my-6" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-x-0 top-1/2 h-px bg-gray-700/30" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative inline-flex justify-center px-2 bg-white dark:bg-gray-800 text-sm text-gray-400" },
});
const __VLS_110 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    ...{ 'onClick': {} },
    type: "default",
    block: true,
    ...{ class: "flex flex-row items-center justify-center gap-10 text-white" },
}));
const __VLS_112 = __VLS_111({
    ...{ 'onClick': {} },
    type: "default",
    block: true,
    ...{ class: "flex flex-row items-center justify-center gap-10 text-white" },
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
let __VLS_114;
let __VLS_115;
const __VLS_116 = ({ click: {} },
    { onClick: (__VLS_ctx.signUpWithGoogle) });
const { default: __VLS_117 } = __VLS_113.slots;
// @ts-ignore
[signUpWithGoogle,];
const __VLS_118 = {}.NImage;
/** @type {[typeof __VLS_components.NImage, typeof __VLS_components.nImage, ]} */ ;
// @ts-ignore
NImage;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    width: "40",
    src: (__VLS_ctx.google_logo),
}));
const __VLS_120 = __VLS_119({
    width: "40",
    src: (__VLS_ctx.google_logo),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
// @ts-ignore
[google_logo,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
var __VLS_113;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mt-6 text-center text-sm text-gray-400" },
});
const __VLS_123 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
// @ts-ignore
RouterLink;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
    to: "/auth/login",
    ...{ class: "font-medium text-amber-500 hover:text-amber-400" },
}));
const __VLS_125 = __VLS_124({
    to: "/auth/login",
    ...{ class: "font-medium text-amber-500 hover:text-amber-400" },
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
const { default: __VLS_127 } = __VLS_126.slots;
var __VLS_126;
var __VLS_23;
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
/** @type {__VLS_StyleScopedClasses['w-48']} */ ;
/** @type {__VLS_StyleScopedClasses['h-48']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-[-50px]']} */ ;
/** @type {__VLS_StyleScopedClasses['right-[-50px]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-5']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['w-36']} */ ;
/** @type {__VLS_StyleScopedClasses['h-36']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pothole-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['h-32']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-pothole-fill']} */ ;
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
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
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
/** @type {__VLS_StyleScopedClasses['flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
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
// @ts-ignore
var __VLS_25 = __VLS_24;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        RouterLink: RouterLink,
        NForm: NForm,
        NFormItem: NFormItem,
        NInput: NInput,
        NButton: NButton,
        NSelect: NSelect,
        FaRoad: FaRoad,
        FaCar: FaCar,
        FaTrafficLight: FaTrafficLight,
        FaMapMarkedAlt: FaMapMarkedAlt,
        google_logo: google_logo,
        year: year,
        formRef: formRef,
        formValue: formValue,
        rules: rules,
        countryOptions: countryOptions,
        isLoading: isLoading,
        error: error,
        handleSubmit: handleSubmit,
        signUpWithGoogle: signUpWithGoogle,
        particleStyle: particleStyle,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
