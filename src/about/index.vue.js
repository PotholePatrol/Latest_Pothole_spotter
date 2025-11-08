/// <reference types="C:/Users/kariu/Desktop/Latest_Pothole_spotter/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { Road as FaRoad, CarCrash as FaCarCrash, ChartLine as FaChartLine, MapMarkedAlt as FaMapMarkedAlt, Users as FaUsers, Lightbulb as FaLightbulb } from '@vicons/fa';
import { NButton } from 'naive-ui';
import { Play as PlayIcon, Pause as PauseIcon, VolumeMute as VolumeMuteIcon, VolumeHigh as VolumeHighIcon } from '@vicons/ionicons5';
import { ref } from 'vue';
import aboutVideo from '../assets/MicrosoftTeams-video.mp4';
// 🔹 State management
const videoRef = ref(null);
const isPlaying = ref(true);
const isMuted = ref(true);
const togglePlay = () => {
    if (!videoRef.value)
        return;
    if (isPlaying.value) {
        videoRef.value.pause();
    }
    else {
        videoRef.value.play();
    }
    isPlaying.value = !isPlaying.value;
};
const toggleMute = () => {
    if (!videoRef.value)
        return;
    videoRef.value.muted = !isMuted.value;
    isMuted.value = !isMuted.value;
};
const features = [
    {
        name: 'Accurate Detection',
        description: 'Our AI models identify potholes with precision, reducing false positives and ensuring reliable data.',
        icon: FaRoad
    },
    {
        name: 'Damage Prevention',
        description: 'Early detection helps prevent small cracks from developing into dangerous potholes.',
        icon: FaCarCrash
    },
    {
        name: 'Cost Savings',
        description: 'Cities save up to 40% on road maintenance by addressing issues before they worsen.',
        icon: FaChartLine
    },
    {
        name: 'Real-time Mapping',
        description: 'Instant updates to municipal dashboards show exactly where repairs are needed most.',
        icon: FaMapMarkedAlt
    },
    {
        name: 'Community Engagement',
        description: 'Citizens can report issues and track repair progress through our public portal.',
        icon: FaUsers
    },
    {
        name: 'Smart Insights',
        description: 'Predictive analytics help plan maintenance before problems become visible.',
        icon: FaLightbulb
    }
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-800 dark:to-gray-700 text-white py-20 overflow-hidden" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute inset-0 opacity-10" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500 dark:bg-amber-600 blur-3xl" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-blue-400 dark:bg-blue-500 blur-3xl" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-7xl mx-auto px-6 text-center relative z-10" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-4xl md:text-5xl font-bold mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-xl md:text-2xl max-w-3xl mx-auto opacity-90" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full relative" },
});
__VLS_asFunctionalElement(__VLS_elements.video)({
    ref: "videoRef",
    src: (__VLS_ctx.aboutVideo),
    ...{ class: "w-full h-auto shadow-lg" },
    autoplay: true,
    loop: true,
    muted: true,
    playsinline: true,
});
/** @type {typeof __VLS_ctx.videoRef} */ ;
// @ts-ignore
[aboutVideo, videoRef,];
const __VLS_0 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.NButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    round: true,
    size: "small",
    ...{ class: "absolute bottom-4 right-14 bg-gray-600 mr-3" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    round: true,
    size: "small",
    ...{ class: "absolute bottom-4 right-14 bg-gray-600 mr-3" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.togglePlay) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[togglePlay,];
{
    const { icon: __VLS_8 } = __VLS_3.slots;
    const __VLS_9 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const { default: __VLS_13 } = __VLS_12.slots;
    const __VLS_14 = ((__VLS_ctx.isPlaying ? __VLS_ctx.PauseIcon : __VLS_ctx.PlayIcon));
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    // @ts-ignore
    [isPlaying, PauseIcon, PlayIcon,];
    var __VLS_12;
}
var __VLS_3;
const __VLS_19 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.NButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    ...{ 'onClick': {} },
    tertiary: true,
    round: true,
    size: "small",
    ...{ class: "absolute bottom-4 right-4 bg-gray-600/40" },
}));
const __VLS_21 = __VLS_20({
    ...{ 'onClick': {} },
    tertiary: true,
    round: true,
    size: "small",
    ...{ class: "absolute bottom-4 right-4 bg-gray-600/40" },
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_23;
let __VLS_24;
const __VLS_25 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleMute) });
const { default: __VLS_26 } = __VLS_22.slots;
// @ts-ignore
[toggleMute,];
{
    const { icon: __VLS_27 } = __VLS_22.slots;
    const __VLS_28 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
    const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const { default: __VLS_32 } = __VLS_31.slots;
    const __VLS_33 = ((__VLS_ctx.isMuted ? __VLS_ctx.VolumeMuteIcon : __VLS_ctx.VolumeHighIcon));
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
    const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
    // @ts-ignore
    [isMuted, VolumeMuteIcon, VolumeHighIcon,];
    var __VLS_31;
}
var __VLS_22;
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({
    ...{ class: "py-16 bg-white dark:bg-gray-800 transition-colors" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-7xl mx-auto px-6 text-center" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-base text-amber-500 font-semibold tracking-wide uppercase" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "mt-2 text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-6" },
});
for (const [feature, idx] of __VLS_getVForSourceType((__VLS_ctx.features))) {
    // @ts-ignore
    [features,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        key: (idx),
        ...{ class: "pt-6" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flow-root rounded-lg px-6 pb-8 h-full bg-gray-50 dark:bg-gray-700 transition-colors" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "inline-flex items-center justify-center p-3 bg-amber-500 rounded-md shadow-lg" },
    });
    const __VLS_38 = ((feature.icon));
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        ...{ class: "h-6 w-6 text-white" },
    }));
    const __VLS_40 = __VLS_39({
        ...{ class: "h-6 w-6 text-white" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "mt-8 text-lg font-medium text-gray-900 dark:text-white" },
    });
    (feature.name);
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "mt-5 text-base text-gray-500 dark:text-gray-300" },
    });
    (feature.description);
}
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gradient-to-r']} */ ;
/** @type {__VLS_StyleScopedClasses['from-blue-900']} */ ;
/** @type {__VLS_StyleScopedClasses['to-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:from-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:to-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['py-20']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-10']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-32']} */ ;
/** @type {__VLS_StyleScopedClasses['h-32']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-amber-600']} */ ;
/** @type {__VLS_StyleScopedClasses['blur-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-1/4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-40']} */ ;
/** @type {__VLS_StyleScopedClasses['h-40']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['blur-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-90']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-14']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-600/40']} */ ;
/** @type {__VLS_StyleScopedClasses['py-16']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['uppercase']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-20']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-12']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-root']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        NButton: NButton,
        PlayIcon: PlayIcon,
        PauseIcon: PauseIcon,
        VolumeMuteIcon: VolumeMuteIcon,
        VolumeHighIcon: VolumeHighIcon,
        aboutVideo: aboutVideo,
        videoRef: videoRef,
        isPlaying: isPlaying,
        isMuted: isMuted,
        togglePlay: togglePlay,
        toggleMute: toggleMute,
        features: features,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
