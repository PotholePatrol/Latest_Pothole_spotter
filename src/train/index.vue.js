/// <reference types="C:/Users/kariu/Desktop/Latest_Pothole_spotter/node_modules/.vue-global-types/vue_3.5_0.d.ts" />
import { ref } from "vue";
import axios from "axios";
const file = ref(null);
const preview = ref(null);
const response = ref(null);
const loading = ref(false);
const error = ref(null);
const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        file.value = selectedFile;
        error.value = null;
        // Generate preview URL
        preview.value = URL.createObjectURL(selectedFile);
        console.log("Selected file:", selectedFile.name);
    }
    else {
        file.value = null;
        preview.value = null;
        error.value = "No file selected";
    }
};
const uploadFile = async () => {
    if (!file.value) {
        error.value = "Please select a file";
        return;
    }
    loading.value = true;
    error.value = null;
    response.value = null;
    try {
        const formData = new FormData();
        formData.append("file", file.value); // must match FastAPI parameter name
        console.log("Uploading:", file.value.name);
        const res = await axios.post("http://127.0.0.1:8000/analyze", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        response.value = res.data;
        console.log("response::", res);
    }
    catch (err) {
        error.value = err.response?.data?.detail || err.message;
    }
    finally {
        loading.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-6 max-w-md mx-auto space-y-4" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-xl font-bold" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleFileChange) },
    type: "file",
    accept: "image/*",
    ...{ class: "border p-2 rounded w-full" },
});
// @ts-ignore
[handleFileChange,];
if (__VLS_ctx.preview) {
    // @ts-ignore
    [preview,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm text-gray-600" },
    });
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (__VLS_ctx.preview),
        alt: "Selected",
        ...{ class: "mt-2 w-full rounded shadow" },
    });
    // @ts-ignore
    [preview,];
}
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.uploadFile) },
    ...{ class: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4" },
    disabled: (__VLS_ctx.loading),
});
// @ts-ignore
[uploadFile, loading,];
(__VLS_ctx.loading ? "Uploading..." : "Analyze");
// @ts-ignore
[loading,];
if (__VLS_ctx.error) {
    // @ts-ignore
    [error,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-red-500 mt-2" },
    });
    (__VLS_ctx.error);
    // @ts-ignore
    [error,];
}
if (__VLS_ctx.response) {
    // @ts-ignore
    [response,];
    __VLS_asFunctionalElement(__VLS_elements.pre, __VLS_elements.pre)({
        ...{ class: "bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap mt-4" },
    });
    (__VLS_ctx.response);
    // @ts-ignore
    [response,];
}
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        preview: preview,
        response: response,
        loading: loading,
        error: error,
        handleFileChange: handleFileChange,
        uploadFile: uploadFile,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
