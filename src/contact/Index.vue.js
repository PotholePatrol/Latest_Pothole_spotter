import { ref, onMounted, watch } from 'vue';
import { NButton, NCard, NDivider, NAvatar, NIcon } from 'naive-ui';
import { API_BASE_URL } from '@/utils/index.js';
import { useUserStore } from '../store/userStore';
import { User as FaUser, Envelope as FaEnvelope, PaperPlane as FaPaperPlane, Globe as FaGlobe, ThumbsUp as FaThumbsUp, ThumbsDown as FaThumbsDown, Reply as FaReply } from '@vicons/fa';
const message = ref('');
const isPublic = ref(true);
const userStore = useUserStore();
const messages = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const name = ref('');
const email = ref('');
watch(() => userStore.user, (user) => {
    if (user?.email) {
        name.value = user.firstName || '';
        email.value = user.email || '';
    }
}, { immediate: true });
async function fetchPublicMessages() {
    try {
        const res = await fetch(`${API_BASE_URL}/contact_us_messages`);
        const data = await res.json();
        messages.value = data.messages ?? data ?? [];
    }
    catch (err) {
        console.error(err);
    }
}
async function sendMessage() {
    if (!message.value.trim()) {
        error.value = 'Please enter a message';
        return;
    }
    loading.value = true;
    error.value = '';
    success.value = '';
    try {
        const res = await fetch(`${API_BASE_URL}/contact_us_messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: message.value,
                name: name.value.trim() || 'Anonymous',
                email: email.value,
                isPublic: isPublic.value
            })
        });
        const result = await res.json();
        const newMessage = result.messageData ?? result;
        if (isPublic.value)
            messages.value = [newMessage, ...messages.value];
        message.value = '';
        success.value = isPublic.value ? 'Message posted publicly!' : 'Private message sent!';
    }
    catch (err) {
        error.value = 'Failed to send message';
        console.error(err);
    }
    finally {
        loading.value = false;
    }
}
async function handleVote(id, isLike) {
    try {
        if (!userStore.user?.id)
            return;
        const res = await fetch(`${API_BASE_URL}/messages/${id}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                isLike,
                userId: userStore.user.id,
                commentId: id
            }),
        });
        if (!res.ok) {
            console.error("Failed to submit vote", await res.text());
            return;
        }
        // Update UI state optimistically
        messages.value = messages.value.map((m) => {
            if (m.id !== id)
                return m;
            // Ensure likes/dislikes are arrays
            const likes = Array.isArray(m.likes) ? [...m.likes] : [];
            const dislikes = Array.isArray(m.dislikes) ? [...m.dislikes] : [];
            // Remove user from both arrays first
            const newLikes = likes.filter((uid) => uid !== userStore.user?.id);
            const newDislikes = dislikes.filter((uid) => uid !== userStore.user?.id);
            // Add user to the correct one
            if (isLike) {
                newLikes.push(userStore.user.id);
            }
            else {
                newDislikes.push(userStore.user.id);
            }
            return {
                ...m,
                likes: newLikes,
                dislikes: newDislikes,
                userVote: isLike ? "like" : "dislike",
            };
        });
    }
    catch (err) {
        console.error("Vote error:", err);
    }
}
function formatDate(s) {
    if (!s)
        return '';
    return new Date(s).toLocaleString();
}
function displayNumber(v) {
    return v == null ? 0 : v;
}
onMounted(() => {
    fetchPublicMessages();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-6 md:p-10 mx-auto min-h-screen max-w-6xl transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "mb-8 text-center" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-3xl md:text-4xl font-extrabold text-black dark:text-white" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "mt-2 text-sm text-gray-600 dark:text-gray-400" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-10" },
});
__VLS_asFunctionalElement(__VLS_elements.section, __VLS_elements.section)({});
const __VLS_0 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
NCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-6" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_4 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex flex-col gap-6" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-2xl font-semibold text-black dark:text-white" },
});
const __VLS_5 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    name: "fade",
}));
const __VLS_7 = __VLS_6({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const { default: __VLS_9 } = __VLS_8.slots;
if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "rounded-md p-3 bg-red-600 text-white text-sm" },
    });
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
}
var __VLS_8;
const __VLS_10 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
Transition;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    name: "fade",
}));
const __VLS_12 = __VLS_11({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const { default: __VLS_14 } = __VLS_13.slots;
if (__VLS_ctx.success) {
    // @ts-ignore
    [success,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "rounded-md p-3 bg-green-600 text-white text-sm" },
    });
    (__VLS_ctx.success);
    // @ts-ignore
    [success,];
}
var __VLS_13;
__VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
    ...{ onSubmit: (__VLS_ctx.sendMessage) },
    ...{ class: "grid gap-4" },
});
// @ts-ignore
[sendMessage,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "relative block" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute left-3 top-[30%] pointer-events-none" },
});
const __VLS_15 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
    component: (__VLS_ctx.FaUser),
    ...{ class: "icon" },
}));
const __VLS_17 = __VLS_16({
    component: (__VLS_ctx.FaUser),
    ...{ class: "icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
// @ts-ignore
[FaUser,];
__VLS_asFunctionalElement(__VLS_elements.input)({
    value: (__VLS_ctx.name),
    type: "text",
    placeholder: "Your name (optional)",
    ...{ class: "w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" },
});
// @ts-ignore
[name,];
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "relative block" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute left-3 top-[30%] pointer-events-none" },
});
const __VLS_20 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    component: (__VLS_ctx.FaEnvelope),
    ...{ class: "icon" },
}));
const __VLS_22 = __VLS_21({
    component: (__VLS_ctx.FaEnvelope),
    ...{ class: "icon" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
// @ts-ignore
[FaEnvelope,];
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "email",
    placeholder: "your@email.com",
    ...{ class: "w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" },
});
(__VLS_ctx.email);
// @ts-ignore
[email,];
__VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
    value: (__VLS_ctx.message),
    rows: "5",
    placeholder: "Type your message here...",
    ...{ class: "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y focus:ring-2 focus:ring-blue-500 outline-none" },
});
// @ts-ignore
[message,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-4" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "flex items-center gap-2 text-sm" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "checkbox",
    ...{ class: "form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" },
});
(__VLS_ctx.isPublic);
// @ts-ignore
[isPublic,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "flex items-center gap-2 text-gray-700 dark:text-gray-300" },
});
const __VLS_25 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    component: (__VLS_ctx.FaGlobe),
    ...{ class: "icon-xs" },
}));
const __VLS_27 = __VLS_26({
    component: (__VLS_ctx.FaGlobe),
    ...{ class: "icon-xs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
// @ts-ignore
[FaGlobe,];
const __VLS_30 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
    ...{ class: "ml-auto px-5 py-2 rounded-lg shadow-md flex items-center gap-2" },
    type: "primary",
    htmlType: "submit",
}));
const __VLS_32 = __VLS_31({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.loading),
    disabled: (__VLS_ctx.loading),
    ...{ class: "ml-auto px-5 py-2 rounded-lg shadow-md flex items-center gap-2" },
    type: "primary",
    htmlType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_34;
let __VLS_35;
const __VLS_36 = ({ click: {} },
    { onClick: (__VLS_ctx.sendMessage) });
const { default: __VLS_37 } = __VLS_33.slots;
// @ts-ignore
[sendMessage, loading, loading,];
const __VLS_38 = {}.NIcon;
/** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
// @ts-ignore
NIcon;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    component: (__VLS_ctx.FaPaperPlane),
    ...{ class: "icon-sm" },
}));
const __VLS_40 = __VLS_39({
    component: (__VLS_ctx.FaPaperPlane),
    ...{ class: "icon-sm" },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
// @ts-ignore
[FaPaperPlane,];
(__VLS_ctx.isPublic ? 'Post Publicly' : 'Send Privately');
// @ts-ignore
[isPublic,];
var __VLS_33;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_elements.aside, __VLS_elements.aside)({});
const __VLS_43 = {}.NDivider;
/** @type {[typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, ]} */ ;
// @ts-ignore
NDivider;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    ...{ class: "mb-4" },
}));
const __VLS_45 = __VLS_44({
    ...{ class: "mb-4" },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const { default: __VLS_47 } = __VLS_46.slots;
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-lg font-medium px-3 text-black dark:text-white" },
});
(__VLS_ctx.messages.length);
// @ts-ignore
[messages,];
var __VLS_46;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid gap-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2" },
});
if (__VLS_ctx.messages.length === 0) {
    // @ts-ignore
    [messages,];
    const __VLS_48 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    NCard;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl" },
    }));
    const __VLS_50 = __VLS_49({
        ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_52 } = __VLS_51.slots;
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-center py-6 text-gray-500 dark:text-gray-400 text-sm" },
    });
    var __VLS_51;
}
for (const [msg] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
    // @ts-ignore
    [messages,];
    const __VLS_53 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    NCard;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl hover:shadow-lg transition" },
    }));
    const __VLS_55 = __VLS_54({
        ...{ class: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl hover:shadow-lg transition" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const { default: __VLS_57 } = __VLS_56.slots;
    __VLS_asFunctionalElement(__VLS_elements.article, __VLS_elements.article)({
        ...{ class: "flex gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex-shrink-0" },
    });
    if (msg.profile_pic) {
        const __VLS_58 = {}.NAvatar;
        /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */ ;
        // @ts-ignore
        NAvatar;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            src: (msg.profile_pic),
            size: "large",
        }));
        const __VLS_60 = __VLS_59({
            src: (msg.profile_pic),
            size: "large",
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    }
    else if (msg.name) {
        const __VLS_63 = {}.NAvatar;
        /** @type {[typeof __VLS_components.NAvatar, typeof __VLS_components.nAvatar, ]} */ ;
        // @ts-ignore
        NAvatar;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            text: (msg.username.charAt(0)),
            size: "large",
            ...{ class: "bg-blue-500 text-white font-bold" },
        }));
        const __VLS_65 = __VLS_64({
            text: (msg.username.charAt(0)),
            size: "large",
            ...{ class: "bg-blue-500 text-white font-bold" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-12 h-12 rounded-full flex items-center justify-center bg-blue-500 text-white" },
        });
        const __VLS_68 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            component: (__VLS_ctx.FaUser),
            ...{ class: "icon" },
        }));
        const __VLS_70 = __VLS_69({
            component: (__VLS_ctx.FaUser),
            ...{ class: "icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        // @ts-ignore
        [FaUser,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
        ...{ class: "flex flex-wrap items-center gap-2 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "font-semibold text-black dark:text-white" },
    });
    (msg.username || 'Anonymous');
    __VLS_asFunctionalElement(__VLS_elements.time, __VLS_elements.time)({
        ...{ class: "text-sm text-gray-500 dark:text-gray-400" },
    });
    (__VLS_ctx.formatDate(msg.created_at));
    // @ts-ignore
    [formatDate,];
    if (msg.reply) {
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "mb-3 text-gray-800 dark:text-gray-200 leading-relaxed" },
    });
    (msg.message || msg.content);
    if (msg.reply) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "pl-4 border-l-4 mb-3 border-blue-500 dark:border-blue-600" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center gap-2 text-sm mb-1" },
        });
        const __VLS_73 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
            component: (__VLS_ctx.FaReply),
            ...{ class: "icon-xs bg-blue-100 rounded-full p-0.5" },
        }));
        const __VLS_75 = __VLS_74({
            component: (__VLS_ctx.FaReply),
            ...{ class: "icon-xs bg-blue-100 rounded-full p-0.5" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        // @ts-ignore
        [FaReply,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "font-semibold text-black dark:text-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.time, __VLS_elements.time)({
            ...{ class: "text-xs text-gray-500 dark:text-gray-400" },
        });
        (__VLS_ctx.formatDate(msg.reply_date));
        // @ts-ignore
        [formatDate,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-gray-700 dark:text-gray-300" },
        });
        (msg.reply);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex gap-3 items-center text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleVote(msg.id, true);
                // @ts-ignore
                [handleVote,];
            } },
        'aria-pressed': (msg.userVote === 'like'),
        ...{ class: "icon-btn" },
    });
    const __VLS_78 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        component: (__VLS_ctx.FaThumbsUp),
        ...{ class: "icon-sm" },
    }));
    const __VLS_80 = __VLS_79({
        component: (__VLS_ctx.FaThumbsUp),
        ...{ class: "icon-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    // @ts-ignore
    [FaThumbsUp,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "ml-1" },
    });
    (__VLS_ctx.displayNumber(msg.likes.length));
    // @ts-ignore
    [displayNumber,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleVote(msg.id, false);
                // @ts-ignore
                [handleVote,];
            } },
        'aria-pressed': (msg.userVote === 'dislike'),
        ...{ class: "icon-btn" },
    });
    const __VLS_83 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        component: (__VLS_ctx.FaThumbsDown),
        ...{ class: "icon-sm" },
    }));
    const __VLS_85 = __VLS_84({
        component: (__VLS_ctx.FaThumbsDown),
        ...{ class: "icon-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    // @ts-ignore
    [FaThumbsDown,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "ml-1" },
    });
    (__VLS_ctx.displayNumber(msg.dislikes.length));
    // @ts-ignore
    [displayNumber,];
    var __VLS_56;
}
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-10']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-6xl']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['md:text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-extrabold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-10']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[30%]']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[30%]']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-y']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['form-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[calc(100vh-220px)]']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-green-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-green-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-black']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        NButton: NButton,
        NCard: NCard,
        NDivider: NDivider,
        NAvatar: NAvatar,
        NIcon: NIcon,
        FaUser: FaUser,
        FaEnvelope: FaEnvelope,
        FaPaperPlane: FaPaperPlane,
        FaGlobe: FaGlobe,
        FaThumbsUp: FaThumbsUp,
        FaThumbsDown: FaThumbsDown,
        FaReply: FaReply,
        message: message,
        isPublic: isPublic,
        messages: messages,
        loading: loading,
        error: error,
        success: success,
        name: name,
        email: email,
        sendMessage: sendMessage,
        handleVote: handleVote,
        formatDate: formatDate,
        displayNumber: displayNumber,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
