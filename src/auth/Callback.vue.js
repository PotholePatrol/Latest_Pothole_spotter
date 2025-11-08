import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { useUserStore } from "../store/userStore";
const router = useRouter();
const userStore = useUserStore();
const message = useMessage();
const loading = ref(false);
const error = ref(null);
onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const confusionToken = urlParams.get("token");
    if (!confusionToken) {
        error.value = "No token found in URL";
        message.warning(error.value);
        return;
    }
    try {
        loading.value = true;
        // Save token to store
        userStore.setUser({ id: confusionToken });
        // Optionally validate/refresh with backend
        await userStore.init();
        message.success("signed in successfully!");
    }
    catch (err) {
        error.value = err?.message || "Failed to initialize user";
        message.error(error.value);
    }
    finally {
        loading.value = false;
    }
});
// Redirect once username is set
watch(() => userStore.user?.email, (email) => {
    if (email) {
        router.push("/");
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex flex-col items-center justify-center min-h-screen p-4 gap-4" },
});
const __VLS_0 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
NCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "max-w-md w-full shadow-lg" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "max-w-md w-full shadow-lg" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
{
    const { header: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-xl font-bold" },
    });
}
if (__VLS_ctx.loading) {
    // @ts-ignore
    [loading,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-center" },
    });
    const __VLS_6 = {}.NSpin;
    /** @type {[typeof __VLS_components.NSpin, typeof __VLS_components.nSpin, ]} */ ;
    // @ts-ignore
    NSpin;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        size: "large",
    }));
    const __VLS_8 = __VLS_7({
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "mt-2" },
    });
}
else if (__VLS_ctx.realToken) {
    // @ts-ignore
    [realToken,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    const __VLS_11 = {}.NResult;
    /** @type {[typeof __VLS_components.NResult, typeof __VLS_components.nResult, ]} */ ;
    // @ts-ignore
    NResult;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
        status: "success",
        title: "Login Successful",
        description: "You are now logged in!",
    }));
    const __VLS_13 = __VLS_12({
        status: "success",
        title: "Login Successful",
        description: "You are now logged in!",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
}
else if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    const __VLS_16 = {}.NResult;
    /** @type {[typeof __VLS_components.NResult, typeof __VLS_components.nResult, ]} */ ;
    // @ts-ignore
    NResult;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        status: "error",
        title: "Login Failed",
        description: (__VLS_ctx.error),
    }));
    const __VLS_18 = __VLS_17({
        status: "error",
        title: "Login Failed",
        description: (__VLS_ctx.error),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    // @ts-ignore
    [error,];
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        loading: loading,
        error: error,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
