/// <reference types="C:/Users/kariu/Desktop/Latest_Pothole_spotter/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import Navbar from './Navbar.vue';
import Footer from './Footer.vue';
import Chaticon from './Chaticon.vue';
import { RouterView } from 'vue-router';
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex flex-col min-h-screen w-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300" },
});
/** @type {[typeof Navbar, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Navbar, new Navbar({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_elements.main, __VLS_elements.main)({
    ...{ class: "flex-1 w-full " },
});
const __VLS_4 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
RouterView;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
/** @type {[typeof Chaticon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(Chaticon, new Chaticon({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {[typeof Footer, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(Footer, new Footer({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        Navbar: Navbar,
        Footer: Footer,
        Chaticon: Chaticon,
        RouterView: RouterView,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
