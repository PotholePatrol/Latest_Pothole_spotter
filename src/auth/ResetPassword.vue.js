import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import { END_POINTS } from '../utils/index.js';
const messageApi = useMessage();
// State
const identifier = ref('');
const otp = ref('');
const isLoading = ref(false);
const isIdentifierApproved = ref(false);
const showInputs = ref(false);
const password = ref('');
const confirmPassword = ref('');
// Computed validation
const confirmPasswordStatus = computed(() => {
    if (!confirmPassword.value)
        return undefined;
    return confirmPassword.value === password.value ? 'success' : 'error';
});
// API: Verify identifier (email/phone)
const verifyIdentifier = async () => {
    try {
        isLoading.value = true;
        const { data } = await axios.post(END_POINTS.VERIFY_IDENTIFIER, {
            identifier: identifier.value
        });
        console.log(data);
        isIdentifierApproved.value = data.exists;
        if (!data.exists) {
            messageApi.error(data.message || 'user not found');
        }
        else {
            messageApi.success(data.message || 'Identifier verified');
        }
    }
    catch (error) {
        messageApi.error('Failed to verify user,check your credentials and try again!');
    }
    finally {
        isLoading.value = false;
    }
};
// API: Verify OTP
const onFinish = async () => {
    try {
        messageApi.loading('Verifying OTP...');
        const { data } = await axios.post(END_POINTS.VERIFY_OTP, {
            otp: otp.value
        });
        if (data.approved) {
            showInputs.value = true;
            isIdentifierApproved.value = false;
            messageApi.success('OTP verified');
        }
        else {
            messageApi.error(data.message || 'Invalid OTP');
        }
    }
    catch (error) {
        messageApi.error('Failed to verify OTP');
    }
    finally {
        isLoading.value = false;
    }
};
const onUpdateValue = (val) => {
    otp.value = val;
};
// API: Save new password
const savePassword = async () => {
    if (confirmPasswordStatus.value !== 'success') {
        messageApi.error('Passwords do not match');
        return;
    }
    try {
        isLoading.value = true;
        const { data } = await axios.post(END_POINTS.SAVE_PASSWORD, {
            identifier: identifier.value,
            password: password.value
        });
        if (data.success) {
            messageApi.success('Password updated successfully');
            showInputs.value = false;
        }
        else {
            messageApi.error(data.message || 'Failed to save password');
        }
    }
    catch (error) {
        messageApi.error('Error while saving password');
    }
    finally {
        isLoading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    'border-b-black': true,
    ...{ class: "max-w-md mx-auto my-10 p-6 !border-1 border-green-500 rounded-2xl shadow-2xl backdrop-blur-xl" },
});
const __VLS_0 = {}.NSpace;
/** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
// @ts-ignore
NSpace;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    vertical: true,
}));
const __VLS_2 = __VLS_1({
    vertical: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
const __VLS_5 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    value: (__VLS_ctx.identifier),
    type: "text",
    placeholder: "Enter your email or phone number",
    loading: (__VLS_ctx.isLoading),
}));
const __VLS_7 = __VLS_6({
    value: (__VLS_ctx.identifier),
    type: "text",
    placeholder: "Enter your email or phone number",
    loading: (__VLS_ctx.isLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[identifier, isLoading,];
if (!__VLS_ctx.isIdentifierApproved) {
    // @ts-ignore
    [isIdentifierApproved,];
    const __VLS_10 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.isLoading),
        disabled: (!__VLS_ctx.identifier),
    }));
    const __VLS_12 = __VLS_11({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.isLoading),
        disabled: (!__VLS_ctx.identifier),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_14;
    let __VLS_15;
    const __VLS_16 = ({ click: {} },
        { onClick: (__VLS_ctx.verifyIdentifier) });
    const { default: __VLS_17 } = __VLS_13.slots;
    // @ts-ignore
    [identifier, isLoading, verifyIdentifier,];
    var __VLS_13;
}
var __VLS_3;
if (__VLS_ctx.isIdentifierApproved) {
    // @ts-ignore
    [isIdentifierApproved,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-6" },
    });
    const __VLS_18 = {}.NGradientText;
    /** @type {[typeof __VLS_components.NGradientText, typeof __VLS_components.NGradientText, ]} */ ;
    // @ts-ignore
    NGradientText;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        type: "success",
    }));
    const __VLS_20 = __VLS_19({
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    const { default: __VLS_22 } = __VLS_21.slots;
    var __VLS_21;
    const __VLS_23 = {}.NInputOtp;
    /** @type {[typeof __VLS_components.NInputOtp, typeof __VLS_components.nInputOtp, ]} */ ;
    // @ts-ignore
    NInputOtp;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
        ...{ 'onFinish': {} },
        ...{ 'onUpdate:value': {} },
        value: (__VLS_ctx.otp),
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onFinish': {} },
        ...{ 'onUpdate:value': {} },
        value: (__VLS_ctx.otp),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_27;
    let __VLS_28;
    const __VLS_29 = ({ finish: {} },
        { onFinish: (__VLS_ctx.onFinish) });
    const __VLS_30 = ({ 'update:value': {} },
        { 'onUpdate:value': (__VLS_ctx.onUpdateValue) });
    // @ts-ignore
    [otp, onFinish, onUpdateValue,];
    var __VLS_26;
}
if (__VLS_ctx.showInputs) {
    // @ts-ignore
    [showInputs,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-6" },
    });
    const __VLS_32 = {}.NSpace;
    /** @type {[typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, typeof __VLS_components.NSpace, typeof __VLS_components.nSpace, ]} */ ;
    // @ts-ignore
    NSpace;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        vertical: true,
    }));
    const __VLS_34 = __VLS_33({
        vertical: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const { default: __VLS_36 } = __VLS_35.slots;
    const __VLS_37 = {}.NInput;
    /** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
    // @ts-ignore
    NInput;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        value: (__VLS_ctx.password),
        type: "password",
        placeholder: "Enter new password",
    }));
    const __VLS_39 = __VLS_38({
        value: (__VLS_ctx.password),
        type: "password",
        placeholder: "Enter new password",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    // @ts-ignore
    [password,];
    const __VLS_42 = {}.NInput;
    /** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
    // @ts-ignore
    NInput;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
        value: (__VLS_ctx.confirmPassword),
        type: "password",
        status: (__VLS_ctx.confirmPasswordStatus),
        placeholder: "Confirm new password",
    }));
    const __VLS_44 = __VLS_43({
        value: (__VLS_ctx.confirmPassword),
        type: "password",
        status: (__VLS_ctx.confirmPasswordStatus),
        placeholder: "Confirm new password",
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    // @ts-ignore
    [confirmPassword, confirmPasswordStatus,];
    var __VLS_35;
    const __VLS_47 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        ...{ 'onClick': {} },
        ...{ class: "mt-4" },
        type: "success",
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onClick': {} },
        ...{ class: "mt-4" },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_51;
    let __VLS_52;
    const __VLS_53 = ({ click: {} },
        { onClick: (__VLS_ctx.savePassword) });
    const { default: __VLS_54 } = __VLS_50.slots;
    // @ts-ignore
    [savePassword,];
    var __VLS_50;
}
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['my-10']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['!border-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['backdrop-blur-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        identifier: identifier,
        otp: otp,
        isLoading: isLoading,
        isIdentifierApproved: isIdentifierApproved,
        showInputs: showInputs,
        password: password,
        confirmPassword: confirmPassword,
        confirmPasswordStatus: confirmPasswordStatus,
        verifyIdentifier: verifyIdentifier,
        onFinish: onFinish,
        onUpdateValue: onUpdateValue,
        savePassword: savePassword,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
