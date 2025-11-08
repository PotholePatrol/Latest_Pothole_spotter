import { computed } from 'vue';
import { darkTheme } from 'naive-ui';
import PageContent from './components/index.vue';
import { useUserStore } from './store/userStore';
const userStore = useUserStore();
const resolvedTheme = computed(() => userStore.theme === 'dark' ? darkTheme : null);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.NConfigProvider;
/** @type {[typeof __VLS_components.NConfigProvider, typeof __VLS_components.nConfigProvider, typeof __VLS_components.NConfigProvider, typeof __VLS_components.nConfigProvider, ]} */ ;
// @ts-ignore
NConfigProvider;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    theme: (__VLS_ctx.resolvedTheme),
}));
const __VLS_2 = __VLS_1({
    theme: (__VLS_ctx.resolvedTheme),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[resolvedTheme,];
const __VLS_6 = {}.NLoadingBarProvider;
/** @type {[typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, ]} */ ;
// @ts-ignore
NLoadingBarProvider;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_10 } = __VLS_9.slots;
const __VLS_11 = {}.NMessageProvider;
/** @type {[typeof __VLS_components.NMessageProvider, typeof __VLS_components.nMessageProvider, typeof __VLS_components.NMessageProvider, typeof __VLS_components.nMessageProvider, ]} */ ;
// @ts-ignore
NMessageProvider;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_15 } = __VLS_14.slots;
const __VLS_16 = {}.NNotificationProvider;
/** @type {[typeof __VLS_components.NNotificationProvider, typeof __VLS_components.nNotificationProvider, typeof __VLS_components.NNotificationProvider, typeof __VLS_components.nNotificationProvider, ]} */ ;
// @ts-ignore
NNotificationProvider;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const { default: __VLS_20 } = __VLS_19.slots;
const __VLS_21 = {}.NDialogProvider;
/** @type {[typeof __VLS_components.NDialogProvider, typeof __VLS_components.nDialogProvider, typeof __VLS_components.NDialogProvider, typeof __VLS_components.nDialogProvider, ]} */ ;
// @ts-ignore
NDialogProvider;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const { default: __VLS_25 } = __VLS_24.slots;
/** @type {[typeof PageContent, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(PageContent, new PageContent({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
var __VLS_24;
var __VLS_19;
var __VLS_14;
var __VLS_9;
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        PageContent: PageContent,
        resolvedTheme: resolvedTheme,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
