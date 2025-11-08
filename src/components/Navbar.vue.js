import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NButton } from 'naive-ui';
import { Menu, Close } from '@vicons/ionicons5';
import { Road as FaRoad, Sun as FaSun, Moon as FaMoon, Home as FaHome, InfoCircle as FaInfoCircle, SignInAlt as FaSignInAlt, UserPlus as FaUserPlus } from '@vicons/fa';
import logoDark from '@/assets/pothole-logo.png';
import { useUserStore } from '../store/userStore';
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const isOpen = ref(false);
const scrolled = ref(false);
const activeDropdown = ref(null);
const navRef = ref(null);
const isDark = ref(userStore.theme === 'dark');
const navItems = computed(() => [
    { path: '/', name: 'Home', icon: FaHome },
    { path: '/about', name: 'About', icon: FaInfoCircle },
    {
        name: 'Services',
        icon: FaRoad,
        subItems: [
            { path: '/?map=true', name: 'Full Map' },
            { path: '/services/2', name: 'Service 2' },
            { path: '/services/3', name: 'Service 3' }
        ]
    },
    userStore.user?.id
        ? { path: '/profile', name: userStore.user?.firstName || 'User', icon: FaUserPlus, cta: true }
        : { path: '/auth/login', name: 'Login', icon: FaSignInAlt, cta: true }
]);
watch(() => route.fullPath, () => {
    isOpen.value = false;
    activeDropdown.value = null;
});
const handleScroll = () => { scrolled.value = window.scrollY > 10; };
onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('click', handleClickOutside);
});
function handleClickOutside(e) {
    if (navRef.value && !navRef.value.contains(e.target))
        activeDropdown.value = null;
}
function toggleMenu() { isOpen.value = !isOpen.value; }
function toggleDropdown(name) { activeDropdown.value = activeDropdown.value === name ? null : name; }
function closeDropdown() { activeDropdown.value = null; }
function closeMobile() { isOpen.value = false; activeDropdown.value = null; }
function goHome() { router.push('/'); }
function toggleDark() {
    isDark.value = !isDark.value;
    userStore.setTheme(isDark.value ? 'dark' : 'light');
}
function navLinkClass(item) {
    const isActive = route.path === item.path;
    return isActive
        ? 'bg-blue-700 text-white dark:bg-gray-700 dark:text-white'
        : 'text-gray-800 hover:bg-blue-800 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700';
}
function dropdownBtnClass(item) {
    const isActive = activeDropdown.value === item.name;
    return isActive
        ? 'bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-white'
        : 'text-gray-800 hover:bg-blue-800 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700';
}
function mobileNavLinkClass(item) {
    const isActive = route.path === item.path;
    return isActive
        ? 'bg-blue-700 text-white dark:bg-gray-700 dark:text-white'
        : 'text-gray-200 hover:bg-blue-700 dark:text-gray-300 dark:hover:bg-gray-700';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.nav, __VLS_elements.nav)({
    ref: "navRef",
    ...{ class: ([
            'sticky top-0 w-full z-50 transition-all duration-300 mb-[50px] !z-[1000]',
            __VLS_ctx.scrolled
                ? 'bg-gray-100/95 backdrop-blur-sm shadow-xl dark:bg-gray-900/95'
                : 'bg-white/80 backdrop-blur-sm shadow dark:bg-gray-900/80'
        ]) },
});
/** @type {typeof __VLS_ctx.navRef} */ ;
// @ts-ignore
[scrolled, navRef,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mx-auto px-4 sm:px-6 lg:px-8" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between h-16" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onClick: (__VLS_ctx.goHome) },
    ...{ class: "flex items-center space-x-2 cursor-pointer" },
});
// @ts-ignore
[goHome,];
__VLS_asFunctionalElement(__VLS_elements.img)({
    src: (__VLS_ctx.logoDark),
    alt: "logo",
    ...{ class: "h-12 w-auto" },
});
// @ts-ignore
[logoDark,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "hidden md:flex items-center space-x-2" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
    (item.name);
    // @ts-ignore
    [navItems,];
    if (item.path) {
        const __VLS_0 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
        // @ts-ignore
        RouterLink;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            to: (item.path),
            ...{ class: "flex items-center px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all" },
            ...{ class: (__VLS_ctx.navLinkClass(item)) },
        }));
        const __VLS_2 = __VLS_1({
            to: (item.path),
            ...{ class: "flex items-center px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all" },
            ...{ class: (__VLS_ctx.navLinkClass(item)) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_4 } = __VLS_3.slots;
        // @ts-ignore
        [navLinkClass,];
        const __VLS_5 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
            size: (18),
            component: (item.icon),
        }));
        const __VLS_7 = __VLS_6({
            size: (18),
            component: (item.icon),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "ml-2" },
        });
        (item.name);
        var __VLS_3;
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "relative" },
        });
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(item.path))
                        return;
                    __VLS_ctx.toggleDropdown(item.name);
                    // @ts-ignore
                    [toggleDropdown,];
                } },
            ...{ class: "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all  bg-amber-400/90" },
            ...{ class: (__VLS_ctx.dropdownBtnClass(item)) },
        });
        // @ts-ignore
        [dropdownBtnClass,];
        const __VLS_10 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
            size: (18),
            component: (item.icon),
        }));
        const __VLS_12 = __VLS_11({
            size: (18),
            component: (item.icon),
        }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "ml-2" },
        });
        (item.name);
        const __VLS_15 = {}.transition;
        /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
        // @ts-ignore
        Transition;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
            name: "fade-slide",
        }));
        const __VLS_17 = __VLS_16({
            name: "fade-slide",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        const { default: __VLS_19 } = __VLS_18.slots;
        if (__VLS_ctx.activeDropdown === item.name) {
            // @ts-ignore
            [activeDropdown,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute left-0 mt-2 w-56 rounded-md shadow-lg z-50 bg-white dark:bg-gray-800" },
            });
            for (const [sub] of __VLS_getVForSourceType((item.subItems))) {
                const __VLS_20 = {}.RouterLink;
                /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
                // @ts-ignore
                RouterLink;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                    ...{ 'onClick': {} },
                    key: (sub.path),
                    to: (sub.path),
                    ...{ class: "block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700" },
                }));
                const __VLS_22 = __VLS_21({
                    ...{ 'onClick': {} },
                    key: (sub.path),
                    to: (sub.path),
                    ...{ class: "block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                let __VLS_24;
                let __VLS_25;
                const __VLS_26 = ({ click: {} },
                    { onClick: (__VLS_ctx.closeDropdown) });
                const { default: __VLS_27 } = __VLS_23.slots;
                // @ts-ignore
                [closeDropdown,];
                (sub.name);
                var __VLS_23;
            }
        }
        var __VLS_18;
    }
}
const __VLS_28 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    size: "small",
    circle: true,
    ghost: true,
    'aria-label': "toggle theme",
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    size: "small",
    circle: true,
    ghost: true,
    'aria-label': "toggle theme",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
const __VLS_34 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleDark) });
const { default: __VLS_35 } = __VLS_31.slots;
// @ts-ignore
[toggleDark,];
const __VLS_36 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    size: (18),
    component: (__VLS_ctx.isDark ? __VLS_ctx.FaSun : __VLS_ctx.FaMoon),
}));
const __VLS_38 = __VLS_37({
    size: (18),
    component: (__VLS_ctx.isDark ? __VLS_ctx.FaSun : __VLS_ctx.FaMoon),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
// @ts-ignore
[isDark, FaSun, FaMoon,];
var __VLS_31;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "md:hidden flex items-center space-x-4" },
});
const __VLS_41 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ 'onClick': {} },
    size: "small",
    circle: true,
    ghost: true,
    'aria-label': "toggle theme",
}));
const __VLS_43 = __VLS_42({
    ...{ 'onClick': {} },
    size: "small",
    circle: true,
    ghost: true,
    'aria-label': "toggle theme",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
const __VLS_47 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleDark) });
const { default: __VLS_48 } = __VLS_44.slots;
// @ts-ignore
[toggleDark,];
const __VLS_49 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    size: (18),
    component: (__VLS_ctx.isDark ? __VLS_ctx.FaSun : __VLS_ctx.FaMoon),
}));
const __VLS_51 = __VLS_50({
    size: (18),
    component: (__VLS_ctx.isDark ? __VLS_ctx.FaSun : __VLS_ctx.FaMoon),
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
// @ts-ignore
[isDark, FaSun, FaMoon,];
var __VLS_44;
const __VLS_54 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    ...{ 'onClick': {} },
    circle: true,
    ghost: true,
    'aria-label': "Open menu",
}));
const __VLS_56 = __VLS_55({
    ...{ 'onClick': {} },
    circle: true,
    ghost: true,
    'aria-label': "Open menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
let __VLS_58;
let __VLS_59;
const __VLS_60 = ({ click: {} },
    { onClick: (__VLS_ctx.toggleMenu) });
const { default: __VLS_61 } = __VLS_57.slots;
// @ts-ignore
[toggleMenu,];
const __VLS_62 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    size: (18),
    component: (__VLS_ctx.isOpen ? __VLS_ctx.Close : __VLS_ctx.Menu),
}));
const __VLS_64 = __VLS_63({
    size: (18),
    component: (__VLS_ctx.isOpen ? __VLS_ctx.Close : __VLS_ctx.Menu),
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
// @ts-ignore
[isOpen, Close, Menu,];
var __VLS_57;
const __VLS_67 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    name: "expand",
}));
const __VLS_69 = __VLS_68({
    name: "expand",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_71 } = __VLS_70.slots;
if (__VLS_ctx.isOpen) {
    // @ts-ignore
    [isOpen,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "md:hidden overflow-hidden bg-blue-800 dark:bg-gray-800" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "px-2 pt-2 pb-4 space-y-1" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
        (item.name);
        // @ts-ignore
        [navItems,];
        if (item.path) {
            const __VLS_72 = {}.RouterLink;
            /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
            // @ts-ignore
            RouterLink;
            // @ts-ignore
            const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                ...{ 'onClick': {} },
                to: (item.path),
                ...{ class: "flex items-center px-3 py-3 rounded-md text-base font-medium max-h-[40px]" },
                ...{ class: (__VLS_ctx.mobileNavLinkClass(item)) },
            }));
            const __VLS_74 = __VLS_73({
                ...{ 'onClick': {} },
                to: (item.path),
                ...{ class: "flex items-center px-3 py-3 rounded-md text-base font-medium max-h-[40px]" },
                ...{ class: (__VLS_ctx.mobileNavLinkClass(item)) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_73));
            let __VLS_76;
            let __VLS_77;
            const __VLS_78 = ({ click: {} },
                { onClick: (__VLS_ctx.closeMobile) });
            const { default: __VLS_79 } = __VLS_75.slots;
            // @ts-ignore
            [mobileNavLinkClass, closeMobile,];
            const __VLS_80 = ((item.icon));
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                ...{ class: "mr-3 h-8" },
            }));
            const __VLS_82 = __VLS_81({
                ...{ class: "mr-3 h-8" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_81));
            (item.name);
            var __VLS_75;
        }
        else {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isOpen))
                            return;
                        if (!!(item.path))
                            return;
                        __VLS_ctx.toggleDropdown(item.name);
                        // @ts-ignore
                        [toggleDropdown,];
                    } },
                ...{ class: "flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-white dark:text-gray-300 bg-amber-400/90" },
            });
            const __VLS_85 = ((item.icon));
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                ...{ class: "mr-3 h-8" },
            }));
            const __VLS_87 = __VLS_86({
                ...{ class: "mr-3 h-8" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "ml-3" },
            });
            (item.name);
            if (__VLS_ctx.activeDropdown === item.name) {
                // @ts-ignore
                [activeDropdown,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "pl-8 space-y-1" },
                });
                for (const [sub] of __VLS_getVForSourceType((item.subItems))) {
                    const __VLS_90 = {}.RouterLink;
                    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ]} */ ;
                    // @ts-ignore
                    RouterLink;
                    // @ts-ignore
                    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
                        ...{ 'onClick': {} },
                        key: (sub.path),
                        to: (sub.path),
                        ...{ class: "block px-3 py-2 rounded-md text-base font-medium" },
                        ...{ class: (__VLS_ctx.mobileNavLinkClass({ path: sub.path, name: sub.name })) },
                    }));
                    const __VLS_92 = __VLS_91({
                        ...{ 'onClick': {} },
                        key: (sub.path),
                        to: (sub.path),
                        ...{ class: "block px-3 py-2 rounded-md text-base font-medium" },
                        ...{ class: (__VLS_ctx.mobileNavLinkClass({ path: sub.path, name: sub.name })) },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
                    let __VLS_94;
                    let __VLS_95;
                    const __VLS_96 = ({ click: {} },
                        { onClick: (() => { __VLS_ctx.closeMobile(); __VLS_ctx.activeDropdown = null; }) });
                    const { default: __VLS_97 } = __VLS_93.slots;
                    // @ts-ignore
                    [activeDropdown, mobileNavLinkClass, closeMobile,];
                    (sub.name);
                    var __VLS_93;
                }
            }
        }
    }
}
var __VLS_70;
/** @type {__VLS_StyleScopedClasses['sticky']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-[50px]']} */ ;
/** @type {__VLS_StyleScopedClasses['!z-[1000]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['h-16']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['w-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['tracking-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-400/90']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-56']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[40px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-400/90']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-8']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        NButton: NButton,
        Menu: Menu,
        Close: Close,
        FaSun: FaSun,
        FaMoon: FaMoon,
        logoDark: logoDark,
        isOpen: isOpen,
        scrolled: scrolled,
        activeDropdown: activeDropdown,
        navRef: navRef,
        isDark: isDark,
        navItems: navItems,
        toggleMenu: toggleMenu,
        toggleDropdown: toggleDropdown,
        closeDropdown: closeDropdown,
        closeMobile: closeMobile,
        goHome: goHome,
        toggleDark: toggleDark,
        navLinkClass: navLinkClass,
        dropdownBtnClass: dropdownBtnClass,
        mobileNavLinkClass: mobileNavLinkClass,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
