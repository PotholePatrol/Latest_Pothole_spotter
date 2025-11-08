import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useLoadingBar } from 'naive-ui';
import { NCard, NButton, NTabs, NTabPane, NSwitch, NInput, NProgress, NIcon, NTag, NAlert, NDivider, useMessage, useDialog } from 'naive-ui';
import { CloudUploadOutline, LocationOutline, LocateOutline, TrashOutline, PlayOutline, RefreshOutline, AnalyticsOutline, ImageOutline, DocumentTextOutline, MapOutline, CheckmarkCircleOutline, SearchOutline, CopyOutline, CloseOutline, EyeOutline, PulseOutline } from '@vicons/ionicons5';
import { LMap, LTileLayer, LMarker, LPopup, LPolyline, LControlZoom } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { END_POINTS, getUserLocation, generateRoomId } from '@/utils/index.js';
import socket from "../socket/index.js";
import { useUserStore } from '../store/userStore.js';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DetectionModal from "./DetectionModal.vue";
import CoordinatePopup from "./CoordinatePopup.vue";
dayjs.extend(relativeTime);
const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const loadingBar = useLoadingBar();
const { user } = useUserStore();
const roomId = generateRoomId();
// Initialize socket connections
socket.emit("joinRoom", "live-map-data-v1");
socket.emit("joinRoom", roomId);
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const maxFiles = 5;
const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
});
// Reactive state
const title = ref('SmartRoads System');
const images = ref([]);
const rejectedFiles = ref([]);
const isUploading = ref(false);
const fileInput = ref(null);
const isDragOver = ref(false);
let idCounter = 0;
const location = ref(null);
const locationError = ref(null);
const points = ref([]);
const selectionMode = ref('single');
const isAnalyzing = ref(false);
const progress = ref(0);
const activeTab = ref('input');
const mapHeight = ref('6000px');
const analysisResult = ref(null);
const allData = ref([]);
const predictions = ref([]);
const modalData = ref(null);
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const coordinatePopup = reactive({ visible: false, position: null, content: '' });
const showFullMapButton = ref(false);
const mapRef = ref(null);
const liveMapData = ref([]);
const mapBounds = ref(null);
// Map configuration
// const mapCenter = ref<[number, number]>([-1.2921, 36.8219]) // Nairobi, Kenya
const mapCenter = ref([-0.71567, 37.14928]); // murang'a, Kenya
const mapZoom = ref(12);
const tileUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
// Icons
const startIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
const endIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776030.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});
const messageApi = useMessage();
// Computed properties
const selectionModeBool = computed({
    get: () => selectionMode.value === 'both',
    set: (v) => {
        selectionMode.value = v ? 'both' : 'single';
        if (!v)
            points.value = points.value.slice(0, 1);
    }
});
const uploadedImagesCount = computed(() => images.value.filter(i => i.status === 'success').length);
const hasFilesToUpload = computed(() => images.value.some(i => i.status === 'pending' || i.status === 'error'));
const hasMarkers = computed(() => allData.value.length > 0 || liveMapData.value.length > 0 || points.value.length > 0);
// File handling functions
const viewfullMap = ref(route.query.map === "true");
// watch the route itself
watch(() => route.query.map, (val) => {
    viewfullMap.value = val === "true";
    if (viewfullMap.value) {
        mapHeight.value = window.innerHeight + "px";
    }
    else {
        mapHeight.value = window.innerWidth < 768 ? "300px" : "500px";
    }
}, { immediate: true } // run once on mount
);
watch(() => route.query.detection, (val) => {
    viewfullMap.value = val === "true";
    if (viewfullMap.value) {
        mapHeight.value = window.innerHeight + "px";
    }
    else {
        mapHeight.value = window.innerWidth < 768 ? "300px" : "500px";
    }
}, { immediate: true } // run once on mount
);
function triggerFileSelect() {
    fileInput.value?.click();
}
function handleConfirm() {
    dialog.warning({
        title: 'Authentication Required',
        content: 'You need to be logged in to modify data on this site.',
        positiveText: 'Login Now',
        negativeText: 'Cancel',
        draggable: true,
        onPositiveClick: () => {
            router.push('/auth/login');
        },
        onNegativeClick: () => {
            messageApi.info('You can log in anytime from the login page.');
        }
    });
}
function onDragOver() { isDragOver.value = true; }
function onDragLeave() { isDragOver.value = false; }
function onDrop(e) {
    isDragOver.value = false;
    const dt = e.dataTransfer;
    if (!dt)
        return;
    if (dt.files && dt.files.length)
        addFiles(dt.files);
}
function addFiles(fileList) {
    const list = Array.from(fileList);
    rejectedFiles.value = [];
    for (const file of list) {
        if (images.value.length >= maxFiles) {
            rejectedFiles.value.push(`${file.name} (max ${maxFiles} files)`);
            continue;
        }
        const allowed = acceptedTypes.includes(file.type) || file.type.startsWith('image/');
        if (!allowed) {
            rejectedFiles.value.push(`${file.name} (type not allowed)`);
            continue;
        }
        const preview = URL.createObjectURL(file);
        images.value.push({
            id: ++idCounter,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview,
            allowed: true,
            status: 'pending',
            progress: 0,
            xhr: null
        });
    }
}
async function onFilesSelected(e) {
    const target = e.target;
    if (!target?.files?.length)
        return;
    const list = Array.from(target.files);
    try {
        const dev = await getDeviceLocation();
        location.value = dev;
    }
    catch (err) {
        location.value = null;
        locationError.value = err?.message ?? String(err);
    }
    addFiles(list);
    messageApi.success(`${list.length} image(s) added`);
    if (fileInput.value)
        fileInput.value.value = '';
}
// Upload functions
function uploadFile(index) {
    const entry = images.value[index];
    if (!entry || !entry.allowed)
        return;
    entry.status = 'uploading';
    entry.progress = 0;
    const xhr = new XMLHttpRequest();
    entry.xhr = xhr;
    xhr.open('POST', END_POINTS.UPLOAD_URL, true);
    xhr.upload.onprogress = function (ev) {
        if (ev.lengthComputable) {
            entry.progress = (ev.loaded / ev.total) * 100;
        }
    };
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            entry.progress = 100;
            entry.status = 'success';
            entry.xhr = null;
        }
        else {
            entry.status = 'error';
            entry.xhr = null;
            loadingBar.error();
        }
    };
    xhr.onerror = function () {
        entry.status = 'error';
        entry.xhr = null;
        loadingBar.error();
    };
    const form = new FormData();
    form.append('file', entry.file);
    if (location.value) {
        form.append('lat', String(location.value.lat));
        form.append('lng', String(location.value.lng));
    }
    xhr.send(form);
}
async function uploadAll() {
    isUploading.value = true;
    for (let i = 0; i < images.value.length; i++) {
        if (images.value[i].status === 'pending' || images.value[i].status === 'error') {
            uploadFile(i);
            await waitForFinish(i);
        }
    }
    isUploading.value = false;
}
function waitForFinish(index) {
    return new Promise(resolve => {
        const entry = images.value[index];
        if (!entry)
            return resolve();
        const interval = setInterval(() => {
            if (!entry || (entry.status !== 'uploading' && entry.status !== 'pending')) {
                clearInterval(interval);
                resolve();
            }
        }, 200);
    });
}
function removeFile(index) {
    const entry = images.value[index];
    if (!entry)
        return;
    if (entry.xhr) {
        try {
            entry.xhr.abort();
        }
        catch (e) { }
    }
    try {
        URL.revokeObjectURL(entry.preview);
    }
    catch (e) { }
    images.value.splice(index, 1);
}
function retryUpload(index) {
    const entry = images.value[index];
    if (!entry)
        return;
    entry.status = 'pending';
    entry.progress = 0;
    uploadFile(index);
}
function clearAll() {
    for (let i = images.value.length - 1; i >= 0; i--)
        removeFile(i);
    rejectedFiles.value = [];
}
function niceSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function formatFileType(type) { return type.split('/')[1]?.toUpperCase() || 'IMAGE'; }
function statusClass(s) {
    if (s === 'success')
        return 'text-green-600';
    if (s === 'uploading')
        return 'text-blue-600';
    if (s === 'error')
        return 'text-red-600';
    return 'text-gray-600';
}
// Map and analysis functions
function getRoadTypeTagType(roadType) {
    const types = {
        highway: 'error',
        primary: 'warning',
        secondary: 'info',
        tertiary: 'success',
        residential: 'default',
        unpaved: 'default'
    };
    return types[roadType] || 'default';
}
function getColorForLabel(label) {
    const normalized = (label || '').toLowerCase();
    if (normalized.includes('major'))
        return 'red';
    if (normalized.includes('minor'))
        return 'orange';
    return 'green';
}
function renderStars(count) {
    const filled = '★'.repeat(count);
    const empty = '☆'.repeat(Math.max(0, 5 - count));
    return `<span class="text-yellow-400">${filled}</span><span class="text-gray-300 dark:text-gray-600">${empty}</span>`;
}
function colorIcon(label) {
    const color = getColorForLabel(label);
    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="background:${color};width:20px;height:20px;border-radius:50%"></div>`
    });
}
function liveDataIcon(liveData) {
    const colors = {
        low: 'green',
        medium: 'orange',
        high: 'red'
    };
    const color = colors[liveData.severity] || 'blue';
    return L.divIcon({
        className: 'live-marker',
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`
    });
}
function openModal(entry) { modalData.value = entry; }
async function getDeviceLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation)
            return reject(new Error('Geolocation not supported.'));
        navigator.geolocation.getCurrentPosition((pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), (err) => reject(err), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });
}
async function analyzeSingleImage(file, userId, coords) {
    if (!user?.id) {
        handleConfirm();
        return;
    }
    const form = new FormData();
    if (userId)
        form.append('userId', userId);
    form.append('image', file);
    form.append('lat', String(coords.lat));
    form.append('lng', String(coords.lng));
    try {
        const res = await fetch(END_POINTS.API_ENDPOINT, { method: 'POST', body: form });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.error || 'Analysis failed');
            loadingBar.error();
        }
        return await res.json();
    }
    catch (err) {
        console.error('API Error:', err);
        messageApi.error('Analysis Error: ' + (err?.message || 'Failed to analyze image'));
        loadingBar.error();
        return null;
    }
}
async function analyzeImages() {
    const coords = points.value.length ? points.value[0] : { lat: mapCenter.value[0], lng: mapCenter.value[1] };
    const results = [];
    for (let i = 0; i < images.value.length; i++) {
        const file = images.value[i].file;
        try {
            const data = await analyzeSingleImage(file, user?.id || null, coords);
            if (data) {
                results.push(data);
                progress.value = ((i + 1) / images.value.length) * 100;
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    return results;
}
const roadTypes = [
    { name: 'Highway', value: 'highway', color: 'bg-red-100 text-red-800' },
    { name: 'Primary Road', value: 'primary', color: 'bg-orange-100 text-orange-800' },
    { name: 'Secondary Road', value: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Tertiary Road', value: 'tertiary', color: 'bg-green-100 text-green-800' },
    { name: 'Residential', value: 'residential', color: 'bg-blue-100 text-blue-800' },
    { name: 'Unpaved', value: 'unpaved', color: 'bg-gray-100 text-gray-800' }
];
function processAnalysisResults(results) {
    const randomRoadType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    const result = {
        ...results[0],
        roadType: randomRoadType,
        quality: Math.floor(Math.random() * 5) + 1,
        length: (Math.random() * 10 + 1).toFixed(2),
        condition: Math.random() > 0.5 ? 'Good' : 'Needs Maintenance',
        features: [
            Math.random() > 0.5 ? 'Markings Visible' : 'Faded Markings',
            Math.random() > 0.5 ? 'No Potholes' : 'Some Potholes'
        ].slice(0, 2),
        imagesAnalyzed: images.value.length,
        coordinates: points.value
    };
    analysisResult.value = result;
    allData.value = [...allData.value, ...results];
    predictions.value = [...predictions.value, ...results.map(r => r.label)];
}
async function handleAnalyze() {
    if (!user?.id) {
        handleConfirm();
        return;
    }
    if (!validateAnalysisInputs())
        return;
    const pendingUploads = images.value.filter(f => f.status !== 'success');
    if (pendingUploads.length > 0) {
        messageApi.warning('Please upload all images before analyzing');
        return;
    }
    loadingBar.start();
    isAnalyzing.value = true;
    progress.value = 0;
    analysisResult.value = null;
    try {
        const res = await analyzeImages();
        // console.log("res:", res)
        if (res.length)
            processAnalysisResults(res);
        messageApi.success('Analysis Complete!');
    }
    catch (err) {
        console.error(err);
        messageApi.error('Analysis failed');
        loadingBar.error();
    }
    finally {
        isAnalyzing.value = false;
        loadingBar.finish();
    }
}
function validateAnalysisInputs() {
    if (!images.value.length) {
        messageApi.error('Please upload at least one image');
        return false;
    }
    if (!points.value.length) {
        messageApi.error('Please select at least one point on the map');
        return false;
    }
    if (selectionMode.value === 'both' && points.value.length < 2) {
        messageApi.error('Please select both start and end points');
        return false;
    }
    return true;
}
// Map and search functions
async function handleSearch() {
    if (!searchQuery.value.trim()) {
        messageApi.warning('Please enter a location');
        return;
    }
    isSearching.value = true;
    try {
        const res = await fetch(`${NOMINATIM_API}?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=5`);
        const data = await res.json();
        searchResults.value = data;
        if (data.length) {
            mapCenter.value = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            mapZoom.value = 14;
            messageApi.success(`Showing results for ${data[0].display_name}`);
        }
        else {
            messageApi.info('No locations found');
        }
    }
    catch (err) {
        console.error(err);
        messageApi.error('Search Error');
    }
    finally {
        isSearching.value = false;
    }
}
function handleSearchResultClick(result) {
    // Update map center and zoom to focus on the clicked suggestion
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    getActiveMapDetections({ latitude: lat, longitude: lng });
    if (!isNaN(lat) && !isNaN(lng)) {
        mapCenter.value = [lat, lng];
        mapZoom.value = 16; // zoom in when selecting
        searchResults.value = []; // close dropdown
        searchQuery.value = result.display_name; // put chosen text in input
    }
    else {
        messageApi.error("Invalid location data");
    }
}
function onMapClick(e) {
    const latlng = e.latlng;
    if (!latlng)
        return;
    if (selectionMode.value === 'single')
        points.value = [{ lat: latlng.lat, lng: latlng.lng }];
    else {
        if (points.value.length < 2)
            points.value.push({ lat: latlng.lat, lng: latlng.lng });
        else
            points.value = [points.value[0], { lat: latlng.lat, lng: latlng.lng }];
    }
    coordinatePopup.visible = true;
    coordinatePopup.position = latlng;
    coordinatePopup.content = `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`;
    getActiveMapDetections({ latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) });
}
function useCurrentLocation() {
    navigator.geolocation?.getCurrentPosition(pos => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (selectionMode.value === 'single')
            points.value = [newPos];
        else if (!points.value.length)
            points.value = [newPos];
        else
            points.value = [points.value[0], newPos];
        mapCenter.value = [newPos.lat, newPos.lng];
        mapZoom.value = 15;
    }, err => { messageApi.error('Failed to get location'); });
}
function clearPoints() { points.value = []; }
function copyCoordinates() {
    const coords = points.value.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`).join(' to ');
    navigator.clipboard.writeText(coords);
    messageApi.info('Coordinates copied to clipboard');
}
function clearAllData() {
    clearAll();
    points.value = [];
    analysisResult.value = null;
    allData.value = [];
    predictions.value = [];
    searchQuery.value = '';
    searchResults.value = [];
    messageApi.info('All data has been reset');
}
function exportReport() { messageApi.info('Export not implemented in this template'); }
function viewOnMap() {
    activeTab.value = 'input';
    if (points.value.length && mapRef.value?.mapObject) {
        nextTick(() => {
            mapRef.value.mapObject.flyTo([points.value[0].lat, points.value[0].lng], 15);
        });
    }
}
function showFullMap() {
    const url = window.location.origin + window.location.pathname + '?map=true';
    // window.open(url, '_blank')
    router.push({
        path: "/",
        query: {
            map: 'true'
        }
    });
}
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    showFullMapButton.value = urlParams.get('map') !== 'true';
}
function zoomUpdated(zoom) {
    mapZoom.value = zoom;
}
function centerUpdated(center) {
    mapCenter.value = [center.lat, center.lng];
}
function fitMapToMarkers() {
    if (!mapRef.value?.mapObject)
        return;
    const map = mapRef.value.mapObject;
    const group = new L.FeatureGroup();
    // Add analysis markers
    allData.value.forEach(item => {
        L.marker([item.location.lat, item.location.lng]).addTo(group);
    });
    // Add live data markers
    liveMapData.value.forEach(item => {
        L.marker([item.location.lat, item.location.lng]).addTo(group);
    });
    // Add points if any
    points.value.forEach(point => {
        L.marker([point.lat, point.lng]).addTo(group);
    });
    if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
    }
}
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}
// Socket event handlers
const getActiveMapDetections = async (data) => {
    socket.emit("live_map_data", {
        room: roomId,
        coords: {
            lng: data.longitude,
            lat: data.latitude
        }
    });
};
// Listen for live map data
socket.on("live_map_data", (responseData) => {
    // console.log("📡 Live map data:", responseData)
    const detections = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
            ? responseData.data
            : [];
    detections.forEach((detection) => {
        // console.log(detection)
        processAnalysisResults([detection]);
    });
    // Auto-fit map to markers if we're in results view
    if (activeTab.value === 'results' && liveMapData.value.length > 0) {
        nextTick(() => {
            fitMapToMarkers();
        });
    }
});
// Handle map height on resize
function handleResize() {
    if (typeof window === "undefined")
        return;
    if (!viewfullMap.value) {
        mapHeight.value = window.innerWidth < 768 ? "300px" : "500px";
    }
}
onMounted(() => {
    handleResize();
    if (typeof window !== "undefined") {
        window.addEventListener("resize", handleResize);
    }
    checkUrlParams();
    // Predict user location and center the map
    getUserLocation().then((loc) => {
        if (loc) {
            // console.log("🌍 User location:", loc);
            mapCenter.value = [loc.latitude, loc.longitude];
            mapZoom.value = 15;
            searchQuery.value = loc.city;
            getActiveMapDetections(loc);
        }
    });
    // Initialize map bounds
    nextTick(() => {
        if (mapRef.value?.mapObject) {
            mapBounds.value = mapRef.value.mapObject.getBounds();
        }
    });
});
onUnmounted(() => {
    images.value.forEach(p => {
        try {
            URL.revokeObjectURL(p.preview);
        }
        catch (e) { }
        if (p.xhr) {
            try {
                p.xhr.abort();
            }
            catch (e) { }
        }
    });
    if (typeof window !== 'undefined')
        window.removeEventListener('resize', handleResize);
    // Leave socket rooms
    socket.emit("leaveRoom", "live-map-data-v1");
    socket.emit("leaveRoom", roomId);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.NLoadingBarProvider;
/** @type {[typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, typeof __VLS_components.NLoadingBarProvider, typeof __VLS_components.nLoadingBarProvider, ]} */ ;
// @ts-ignore
NLoadingBarProvider;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "min-h-screen p-4 md:p-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100" },
    ...{ class: ({ 'h-screen !overflow-hidden': __VLS_ctx.viewfullMap }) },
});
// @ts-ignore
[viewfullMap,];
if (__VLS_ctx.modalData) {
    // @ts-ignore
    [modalData,];
    /** @type {[typeof DetectionModal, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(DetectionModal, new DetectionModal({
        ...{ 'onClose': {} },
        modalData: (__VLS_ctx.modalData),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClose': {} },
        modalData: (__VLS_ctx.modalData),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.modalData))
                    return;
                __VLS_ctx.modalData = null;
                // @ts-ignore
                [modalData, modalData,];
            } });
    var __VLS_8;
}
if (__VLS_ctx.coordinatePopup.visible) {
    // @ts-ignore
    [coordinatePopup,];
    /** @type {[typeof CoordinatePopup, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(CoordinatePopup, new CoordinatePopup({
        ...{ 'onClose': {} },
        popup: (__VLS_ctx.coordinatePopup),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClose': {} },
        popup: (__VLS_ctx.coordinatePopup),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    const __VLS_18 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.coordinatePopup.visible))
                    return;
                __VLS_ctx.coordinatePopup.visible = false;
                // @ts-ignore
                [coordinatePopup, coordinatePopup,];
            } });
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-7xl mx-auto" },
});
__VLS_asFunctionalElement(__VLS_elements.header, __VLS_elements.header)({
    ...{ class: "mb-8" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex justify-between items-center" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-3xl font-bold" },
});
(__VLS_ctx.title);
// @ts-ignore
[title,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-gray-600 dark:text-gray-400" },
});
const __VLS_20 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    secondary: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    secondary: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
const __VLS_26 = ({ click: {} },
    { onClick: (__VLS_ctx.showFullMap) });
const { default: __VLS_27 } = __VLS_23.slots;
// @ts-ignore
[showFullMap,];
{
    const { icon: __VLS_28 } = __VLS_23.slots;
    const __VLS_29 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        component: (__VLS_ctx.MapOutline),
    }));
    const __VLS_31 = __VLS_30({
        component: (__VLS_ctx.MapOutline),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    // @ts-ignore
    [MapOutline,];
}
var __VLS_23;
const __VLS_34 = {}.NTabs;
/** @type {[typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, typeof __VLS_components.NTabs, typeof __VLS_components.nTabs, ]} */ ;
// @ts-ignore
NTabs;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    value: (__VLS_ctx.activeTab),
    type: "line",
    animated: true,
}));
const __VLS_36 = __VLS_35({
    value: (__VLS_ctx.activeTab),
    type: "line",
    animated: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
const { default: __VLS_38 } = __VLS_37.slots;
// @ts-ignore
[activeTab,];
const __VLS_39 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
NTabPane;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    name: "input",
    tab: "Data Input",
}));
const __VLS_41 = __VLS_40({
    name: "input",
    tab: "Data Input",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_43 } = __VLS_42.slots;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4" },
    ...{ class: ({ 'flex': __VLS_ctx.viewfullMap }) },
});
// @ts-ignore
[viewfullMap,];
if (!__VLS_ctx.viewfullMap) {
    // @ts-ignore
    [viewfullMap,];
    const __VLS_44 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    NCard;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ class: "h-fit shadow-md border p-4 dark:bg-gray-900" },
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "h-fit shadow-md border p-4 dark:bg-gray-900" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const { default: __VLS_48 } = __VLS_47.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-xl font-semibold" },
    });
    const __VLS_49 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        type: (__VLS_ctx.images.length ? 'primary' : 'default'),
        round: true,
    }));
    const __VLS_51 = __VLS_50({
        type: (__VLS_ctx.images.length ? 'primary' : 'default'),
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const { default: __VLS_53 } = __VLS_52.slots;
    // @ts-ignore
    [images,];
    (__VLS_ctx.images.length);
    (__VLS_ctx.images.length === 1 ? 'image' : 'images');
    // @ts-ignore
    [images, images,];
    var __VLS_52;
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onChange: (__VLS_ctx.onFilesSelected) },
        ref: "fileInput",
        type: "file",
        multiple: true,
        accept: "image/*",
        ...{ class: "hidden" },
    });
    /** @type {typeof __VLS_ctx.fileInput} */ ;
    // @ts-ignore
    [onFilesSelected, fileInput,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.triggerFileSelect) },
        ...{ onDragover: (__VLS_ctx.onDragOver) },
        ...{ onDragleave: (__VLS_ctx.onDragLeave) },
        ...{ onDrop: (__VLS_ctx.onDrop) },
        ...{ class: "border-2 border-dashed rounded p-4 mb-4 transition-all hover:shadow-md cursor-pointer bg-white dark:bg-gray-800" },
        ...{ class: ({ 'ring-2 ring-blue-400': __VLS_ctx.isDragOver }) },
    });
    // @ts-ignore
    [triggerFileSelect, onDragOver, onDragLeave, onDrop, isDragOver,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.triggerFileSelect) },
        type: "button",
        ...{ class: "p-3 rounded-full bg-blue-50 dark:bg-blue-900" },
    });
    // @ts-ignore
    [triggerFileSelect,];
    __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "w-6 h-6" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_elements.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5 5 5M12 5v12",
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-gray-500 dark:text-gray-400" },
    });
    (__VLS_ctx.maxFiles);
    // @ts-ignore
    [maxFiles,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "ml-auto text-right" },
    });
    if (__VLS_ctx.location) {
        // @ts-ignore
        [location,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm text-green-700 dark:text-green-400" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            ...{ class: "inline w-4 h-4 mr-1" },
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M12 11a3 3 0 100-6 3 3 0 000 6z",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'stroke-width': "2",
            d: "M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z",
        });
        (__VLS_ctx.location.lat.toFixed(6));
        (__VLS_ctx.location.lng.toFixed(6));
        // @ts-ignore
        [location, location,];
    }
    if (__VLS_ctx.locationError) {
        // @ts-ignore
        [locationError,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm text-red-600 dark:text-red-400" },
        });
        (__VLS_ctx.locationError);
        // @ts-ignore
        [locationError,];
    }
    if (__VLS_ctx.rejectedFiles.length) {
        // @ts-ignore
        [rejectedFiles,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mt-3 text-sm text-red-600" },
        });
        (__VLS_ctx.rejectedFiles.join(', '));
        // @ts-ignore
        [rejectedFiles,];
    }
    if (__VLS_ctx.images.length) {
        // @ts-ignore
        [images,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-4" },
        });
        for (const [f, i] of __VLS_getVForSourceType((__VLS_ctx.images))) {
            // @ts-ignore
            [images,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (f.id),
                ...{ class: "relative border rounded-lg p-2 bg-white dark:bg-gray-800 transition-all hover:shadow-md group" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "relative" },
            });
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (f.preview),
                alt: (f.name),
                ...{ class: "w-full h-32 object-cover rounded" },
                ...{ class: ({ 'filter grayscale opacity-60': !f.allowed || f.status === 'error' }) },
            });
            if (f.status === 'uploading') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1" },
                });
                const __VLS_54 = {}.NProgress;
                /** @type {[typeof __VLS_components.NProgress, typeof __VLS_components.nProgress, ]} */ ;
                // @ts-ignore
                NProgress;
                // @ts-ignore
                const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
                    type: "line",
                    percentage: (f.progress),
                    height: (6),
                }));
                const __VLS_56 = __VLS_55({
                    type: "line",
                    percentage: (f.progress),
                    height: (6),
                }, ...__VLS_functionalComponentArgsRest(__VLS_55));
            }
            if (f.status === 'error') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center" },
                });
                const __VLS_59 = {}.NIcon;
                /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
                // @ts-ignore
                NIcon;
                // @ts-ignore
                const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
                    component: (__VLS_ctx.CloseOutline),
                    ...{ class: "text-red-600 text-2xl" },
                }));
                const __VLS_61 = __VLS_60({
                    component: (__VLS_ctx.CloseOutline),
                    ...{ class: "text-red-600 text-2xl" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_60));
                // @ts-ignore
                [CloseOutline,];
            }
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-2 text-sm" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "font-medium truncate" },
            });
            (f.name);
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-xs text-gray-500 dark:text-gray-400" },
            });
            (__VLS_ctx.formatFileType(f.type));
            (__VLS_ctx.niceSize(f.size));
            // @ts-ignore
            [formatFileType, niceSize,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-1 flex items-center" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (__VLS_ctx.statusClass(f.status)) },
                ...{ class: "text-sm font-semibold flex-1" },
            });
            // @ts-ignore
            [statusClass,];
            (f.status);
            if (f.status === 'error') {
                const __VLS_64 = {}.NButton;
                /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
                // @ts-ignore
                NButton;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    ...{ 'onClick': {} },
                    text: true,
                    size: "tiny",
                }));
                const __VLS_66 = __VLS_65({
                    ...{ 'onClick': {} },
                    text: true,
                    size: "tiny",
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                let __VLS_68;
                let __VLS_69;
                const __VLS_70 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(!__VLS_ctx.viewfullMap))
                                return;
                            if (!(__VLS_ctx.images.length))
                                return;
                            if (!(f.status === 'error'))
                                return;
                            __VLS_ctx.retryUpload(i);
                            // @ts-ignore
                            [retryUpload,];
                        } });
                const { default: __VLS_71 } = __VLS_67.slots;
                {
                    const { icon: __VLS_72 } = __VLS_67.slots;
                    const __VLS_73 = {}.NIcon;
                    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
                    // @ts-ignore
                    NIcon;
                    // @ts-ignore
                    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
                        component: (__VLS_ctx.RefreshOutline),
                    }));
                    const __VLS_75 = __VLS_74({
                        component: (__VLS_ctx.RefreshOutline),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
                    // @ts-ignore
                    [RefreshOutline,];
                }
                var __VLS_67;
            }
            if (!f.allowed) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded" },
                });
            }
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.viewfullMap))
                            return;
                        if (!(__VLS_ctx.images.length))
                            return;
                        __VLS_ctx.removeFile(i);
                        // @ts-ignore
                        [removeFile,];
                    } },
                ...{ class: "absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full shadow" },
            });
            const __VLS_78 = {}.NIcon;
            /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
            // @ts-ignore
            NIcon;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
                component: (__VLS_ctx.CloseOutline),
                ...{ class: "w-4 h-4 text-gray-700 dark:text-gray-200" },
            }));
            const __VLS_80 = __VLS_79({
                component: (__VLS_ctx.CloseOutline),
                ...{ class: "w-4 h-4 text-gray-700 dark:text-gray-200" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            // @ts-ignore
            [CloseOutline,];
        }
    }
    if (__VLS_ctx.rejectedFiles.length) {
        // @ts-ignore
        [rejectedFiles,];
        const __VLS_83 = {}.NAlert;
        /** @type {[typeof __VLS_components.NAlert, typeof __VLS_components.nAlert, typeof __VLS_components.NAlert, typeof __VLS_components.nAlert, ]} */ ;
        // @ts-ignore
        NAlert;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
            type: "error",
            ...{ class: "mt-4" },
            title: "Some files were rejected:",
        }));
        const __VLS_85 = __VLS_84({
            type: "error",
            ...{ class: "mt-4" },
            title: "Some files were rejected:",
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        const { default: __VLS_87 } = __VLS_86.slots;
        __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
            ...{ class: "list-disc ml-4" },
        });
        for (const [r, idx] of __VLS_getVForSourceType((__VLS_ctx.rejectedFiles))) {
            // @ts-ignore
            [rejectedFiles,];
            __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
                key: (idx),
            });
            (r);
        }
        var __VLS_86;
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex gap-3 mt-4" },
    });
    const __VLS_88 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.images.length),
        type: "primary",
        loading: (__VLS_ctx.isUploading),
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.images.length),
        type: "primary",
        loading: (__VLS_ctx.isUploading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_92;
    let __VLS_93;
    const __VLS_94 = ({ click: {} },
        { onClick: (__VLS_ctx.uploadAll) });
    const { default: __VLS_95 } = __VLS_91.slots;
    // @ts-ignore
    [images, isUploading, uploadAll,];
    {
        const { icon: __VLS_96 } = __VLS_91.slots;
        const __VLS_97 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            component: (__VLS_ctx.CloudUploadOutline),
        }));
        const __VLS_99 = __VLS_98({
            component: (__VLS_ctx.CloudUploadOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        // @ts-ignore
        [CloudUploadOutline,];
    }
    (__VLS_ctx.isUploading ? 'Uploading...' : 'Upload All');
    // @ts-ignore
    [isUploading,];
    var __VLS_91;
    const __VLS_102 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.images.length),
        type: "default",
    }));
    const __VLS_104 = __VLS_103({
        ...{ 'onClick': {} },
        disabled: (!__VLS_ctx.images.length),
        type: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = ({ click: {} },
        { onClick: (__VLS_ctx.clearAll) });
    const { default: __VLS_109 } = __VLS_105.slots;
    // @ts-ignore
    [images, clearAll,];
    var __VLS_105;
    var __VLS_47;
}
const __VLS_110 = {}.NCard;
/** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
// @ts-ignore
NCard;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    ...{ class: "h-fit shadow-md border dark:bg-gray-900 transition-all duration-300" },
    ...{ class: ({
            'fixed inset-0 top-[25px] left-0 !z-[900] w-screen h-screen overflow-y-auto py-5': __VLS_ctx.viewfullMap
        }) },
}));
const __VLS_112 = __VLS_111({
    ...{ class: "h-fit shadow-md border dark:bg-gray-900 transition-all duration-300" },
    ...{ class: ({
            'fixed inset-0 top-[25px] left-0 !z-[900] w-screen h-screen overflow-y-auto py-5': __VLS_ctx.viewfullMap
        }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const { default: __VLS_114 } = __VLS_113.slots;
// @ts-ignore
[viewfullMap,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between mb-4" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-xl font-semibold" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center space-x-2" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-sm text-gray-500 dark:text-gray-400" },
});
const __VLS_115 = {}.NSwitch;
/** @type {[typeof __VLS_components.NSwitch, typeof __VLS_components.nSwitch, ]} */ ;
// @ts-ignore
NSwitch;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    value: (__VLS_ctx.selectionModeBool),
    checkedValue: "both",
    uncheckedValue: "single",
}));
const __VLS_117 = __VLS_116({
    value: (__VLS_ctx.selectionModeBool),
    checkedValue: "both",
    uncheckedValue: "single",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
// @ts-ignore
[selectionModeBool,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-sm" },
});
(__VLS_ctx.selectionMode === 'both' ? 'Start & End Points' : 'Single Point');
// @ts-ignore
[selectionMode,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "relative mb-4" },
});
const __VLS_120 = {}.NInput;
/** @type {[typeof __VLS_components.NInput, typeof __VLS_components.nInput, typeof __VLS_components.NInput, typeof __VLS_components.nInput, ]} */ ;
// @ts-ignore
NInput;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    ...{ 'onKeyup': {} },
    value: (__VLS_ctx.searchQuery),
    placeholder: "Search for a location...",
    clearable: true,
}));
const __VLS_122 = __VLS_121({
    ...{ 'onKeyup': {} },
    value: (__VLS_ctx.searchQuery),
    placeholder: "Search for a location...",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
let __VLS_124;
let __VLS_125;
const __VLS_126 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.handleSearch) });
const { default: __VLS_127 } = __VLS_123.slots;
// @ts-ignore
[searchQuery, handleSearch,];
{
    const { suffix: __VLS_128 } = __VLS_123.slots;
    const __VLS_129 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
        text: true,
        loading: (__VLS_ctx.isSearching),
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
        text: true,
        loading: (__VLS_ctx.isSearching),
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    const { default: __VLS_136 } = __VLS_132.slots;
    // @ts-ignore
    [handleSearch, isSearching,];
    {
        const { icon: __VLS_137 } = __VLS_132.slots;
        const __VLS_138 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            component: (__VLS_ctx.SearchOutline),
        }));
        const __VLS_140 = __VLS_139({
            component: (__VLS_ctx.SearchOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        // @ts-ignore
        [SearchOutline,];
    }
    var __VLS_132;
}
var __VLS_123;
if (__VLS_ctx.searchResults.length) {
    // @ts-ignore
    [searchResults,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto bg-white dark:bg-gray-800 border dark:border-gray-700" },
    });
    for (const [r, i] of __VLS_getVForSourceType((__VLS_ctx.searchResults))) {
        // @ts-ignore
        [searchResults,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.searchResults.length))
                        return;
                    __VLS_ctx.handleSearchResultClick(r);
                    // @ts-ignore
                    [handleSearchResultClick,];
                } },
            key: (i),
            ...{ class: "p-3 cursor-pointer border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "font-medium" },
        });
        (r.display_name);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-xs text-gray-500 dark:text-gray-400" },
        });
        (r.type);
    }
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ style: ({ height: __VLS_ctx.mapHeight }) },
    ...{ class: "relative z-0 rounded" },
});
// @ts-ignore
[mapHeight,];
const __VLS_143 = {}.LMap;
/** @type {[typeof __VLS_components.LMap, typeof __VLS_components.lMap, typeof __VLS_components.LMap, typeof __VLS_components.lMap, ]} */ ;
// @ts-ignore
LMap;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
    ...{ 'onClick': {} },
    ...{ 'onUpdate:zoom': {} },
    ...{ 'onUpdate:center': {} },
    zoom: (__VLS_ctx.mapZoom),
    center: (__VLS_ctx.mapCenter),
    options: ({ zoomControl: false }),
    ...{ style: {} },
    ref: "mapRef",
    useGlobalLeaflet: (false),
}));
const __VLS_145 = __VLS_144({
    ...{ 'onClick': {} },
    ...{ 'onUpdate:zoom': {} },
    ...{ 'onUpdate:center': {} },
    zoom: (__VLS_ctx.mapZoom),
    center: (__VLS_ctx.mapCenter),
    options: ({ zoomControl: false }),
    ...{ style: {} },
    ref: "mapRef",
    useGlobalLeaflet: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
let __VLS_147;
let __VLS_148;
const __VLS_149 = ({ click: {} },
    { onClick: (__VLS_ctx.onMapClick) });
const __VLS_150 = ({ 'update:zoom': {} },
    { 'onUpdate:zoom': (__VLS_ctx.zoomUpdated) });
const __VLS_151 = ({ 'update:center': {} },
    { 'onUpdate:center': (__VLS_ctx.centerUpdated) });
/** @type {typeof __VLS_ctx.mapRef} */ ;
var __VLS_152 = {};
const { default: __VLS_154 } = __VLS_146.slots;
// @ts-ignore
[mapZoom, mapCenter, onMapClick, zoomUpdated, centerUpdated, mapRef,];
const __VLS_155 = {}.LTileLayer;
/** @type {[typeof __VLS_components.LTileLayer, typeof __VLS_components.lTileLayer, ]} */ ;
// @ts-ignore
LTileLayer;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
    url: (__VLS_ctx.tileUrl),
}));
const __VLS_157 = __VLS_156({
    url: (__VLS_ctx.tileUrl),
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
// @ts-ignore
[tileUrl,];
const __VLS_160 = {}.LControlZoom;
/** @type {[typeof __VLS_components.LControlZoom, typeof __VLS_components.lControlZoom, ]} */ ;
// @ts-ignore
LControlZoom;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    position: "bottomright",
}));
const __VLS_162 = __VLS_161({
    position: "bottomright",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
if (__VLS_ctx.points.length > 0) {
    // @ts-ignore
    [points,];
    const __VLS_165 = {}.LMarker;
    /** @type {[typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, ]} */ ;
    // @ts-ignore
    LMarker;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        latLng: (__VLS_ctx.points[0]),
        icon: (__VLS_ctx.startIcon),
    }));
    const __VLS_167 = __VLS_166({
        latLng: (__VLS_ctx.points[0]),
        icon: (__VLS_ctx.startIcon),
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    const { default: __VLS_169 } = __VLS_168.slots;
    // @ts-ignore
    [points, startIcon,];
    const __VLS_170 = {}.LPopup;
    /** @type {[typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, ]} */ ;
    // @ts-ignore
    LPopup;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
    const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
    const { default: __VLS_174 } = __VLS_173.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs" },
    });
    (__VLS_ctx.points[0].lat.toFixed(6));
    // @ts-ignore
    [points,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs" },
    });
    (__VLS_ctx.points[0].lng.toFixed(6));
    // @ts-ignore
    [points,];
    var __VLS_173;
    var __VLS_168;
}
if (__VLS_ctx.points.length > 1) {
    // @ts-ignore
    [points,];
    const __VLS_175 = {}.LMarker;
    /** @type {[typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, ]} */ ;
    // @ts-ignore
    LMarker;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        latLng: (__VLS_ctx.points[1]),
        icon: (__VLS_ctx.endIcon),
    }));
    const __VLS_177 = __VLS_176({
        latLng: (__VLS_ctx.points[1]),
        icon: (__VLS_ctx.endIcon),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    const { default: __VLS_179 } = __VLS_178.slots;
    // @ts-ignore
    [points, endIcon,];
    const __VLS_180 = {}.LPopup;
    /** @type {[typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, ]} */ ;
    // @ts-ignore
    LPopup;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    const { default: __VLS_184 } = __VLS_183.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs" },
    });
    (__VLS_ctx.points[1].lat.toFixed(6));
    // @ts-ignore
    [points,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs" },
    });
    (__VLS_ctx.points[1].lng.toFixed(6));
    // @ts-ignore
    [points,];
    var __VLS_183;
    var __VLS_178;
}
if (__VLS_ctx.points.length > 1) {
    // @ts-ignore
    [points,];
    const __VLS_185 = {}.LPolyline;
    /** @type {[typeof __VLS_components.LPolyline, typeof __VLS_components.lPolyline, ]} */ ;
    // @ts-ignore
    LPolyline;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
        latLngs: (__VLS_ctx.points),
        color: ('#3B82F6'),
        weight: (4),
        dashArray: ('5, 5'),
    }));
    const __VLS_187 = __VLS_186({
        latLngs: (__VLS_ctx.points),
        color: ('#3B82F6'),
        weight: (4),
        dashArray: ('5, 5'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    // @ts-ignore
    [points,];
}
for (const [entry, i] of __VLS_getVForSourceType((__VLS_ctx.allData))) {
    // @ts-ignore
    [allData,];
    const __VLS_190 = {}.LMarker;
    /** @type {[typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, ]} */ ;
    // @ts-ignore
    LMarker;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        ...{ 'onClick': {} },
        key: (i),
        latLng: ([entry.location.lat, entry.location.lng]),
        icon: (__VLS_ctx.colorIcon(entry.label)),
    }));
    const __VLS_192 = __VLS_191({
        ...{ 'onClick': {} },
        key: (i),
        latLng: ([entry.location.lat, entry.location.lng]),
        icon: (__VLS_ctx.colorIcon(entry.label)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    let __VLS_194;
    let __VLS_195;
    const __VLS_196 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openModal(entry);
                // @ts-ignore
                [colorIcon, openModal,];
            } });
    var __VLS_193;
}
for (const [liveData, i] of __VLS_getVForSourceType((__VLS_ctx.liveMapData))) {
    // @ts-ignore
    [liveMapData,];
    const __VLS_198 = {}.LMarker;
    /** @type {[typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, typeof __VLS_components.LMarker, typeof __VLS_components.lMarker, ]} */ ;
    // @ts-ignore
    LMarker;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        ...{ 'onClick': {} },
        key: ('live-' + i),
        latLng: ([liveData.location.lat, liveData.location.lng]),
        icon: (__VLS_ctx.liveDataIcon(liveData)),
    }));
    const __VLS_200 = __VLS_199({
        ...{ 'onClick': {} },
        key: ('live-' + i),
        latLng: ([liveData.location.lat, liveData.location.lng]),
        icon: (__VLS_ctx.liveDataIcon(liveData)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    let __VLS_202;
    let __VLS_203;
    const __VLS_204 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openModal(liveData);
                // @ts-ignore
                [openModal, liveDataIcon,];
            } });
    const { default: __VLS_205 } = __VLS_201.slots;
    const __VLS_206 = {}.LPopup;
    /** @type {[typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, typeof __VLS_components.LPopup, typeof __VLS_components.lPopup, ]} */ ;
    // @ts-ignore
    LPopup;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({}));
    const __VLS_208 = __VLS_207({}, ...__VLS_functionalComponentArgsRest(__VLS_207));
    const { default: __VLS_210 } = __VLS_209.slots;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm font-medium" },
    });
    (liveData.label);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs" },
    });
    (__VLS_ctx.formatDate(liveData.timestamp));
    // @ts-ignore
    [formatDate,];
    var __VLS_209;
    var __VLS_201;
}
var __VLS_146;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "absolute bottom-4 left-4 z-50 flex space-x-2" },
});
const __VLS_211 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
    ...{ 'onClick': {} },
    circle: true,
    title: "Use current location",
}));
const __VLS_213 = __VLS_212({
    ...{ 'onClick': {} },
    circle: true,
    title: "Use current location",
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
let __VLS_215;
let __VLS_216;
const __VLS_217 = ({ click: {} },
    { onClick: (__VLS_ctx.useCurrentLocation) });
const { default: __VLS_218 } = __VLS_214.slots;
// @ts-ignore
[useCurrentLocation,];
{
    const { icon: __VLS_219 } = __VLS_214.slots;
    const __VLS_220 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        component: (__VLS_ctx.LocateOutline),
    }));
    const __VLS_222 = __VLS_221({
        component: (__VLS_ctx.LocateOutline),
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    // @ts-ignore
    [LocateOutline,];
}
var __VLS_214;
const __VLS_225 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    ...{ 'onClick': {} },
    circle: true,
    title: "Clear points",
}));
const __VLS_227 = __VLS_226({
    ...{ 'onClick': {} },
    circle: true,
    title: "Clear points",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
let __VLS_229;
let __VLS_230;
const __VLS_231 = ({ click: {} },
    { onClick: (__VLS_ctx.clearPoints) });
const { default: __VLS_232 } = __VLS_228.slots;
// @ts-ignore
[clearPoints,];
{
    const { icon: __VLS_233 } = __VLS_228.slots;
    const __VLS_234 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
        component: (__VLS_ctx.TrashOutline),
    }));
    const __VLS_236 = __VLS_235({
        component: (__VLS_ctx.TrashOutline),
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    // @ts-ignore
    [TrashOutline,];
}
var __VLS_228;
if (__VLS_ctx.hasMarkers) {
    // @ts-ignore
    [hasMarkers,];
    const __VLS_239 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent(__VLS_239, new __VLS_239({
        ...{ 'onClick': {} },
        circle: true,
        title: "Fit to markers",
    }));
    const __VLS_241 = __VLS_240({
        ...{ 'onClick': {} },
        circle: true,
        title: "Fit to markers",
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    let __VLS_243;
    let __VLS_244;
    const __VLS_245 = ({ click: {} },
        { onClick: (__VLS_ctx.fitMapToMarkers) });
    const { default: __VLS_246 } = __VLS_242.slots;
    // @ts-ignore
    [fitMapToMarkers,];
    {
        const { icon: __VLS_247 } = __VLS_242.slots;
        const __VLS_248 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
            component: (__VLS_ctx.EyeOutline),
        }));
        const __VLS_250 = __VLS_249({
            component: (__VLS_ctx.EyeOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_249));
        // @ts-ignore
        [EyeOutline,];
    }
    var __VLS_242;
}
if (__VLS_ctx.points.length) {
    // @ts-ignore
    [points,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4 space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs font-medium" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "font-mono text-sm" },
    });
    (__VLS_ctx.points[0].lat.toFixed(6));
    (__VLS_ctx.points[0].lng.toFixed(6));
    // @ts-ignore
    [points, points,];
    if (__VLS_ctx.points.length > 1) {
        // @ts-ignore
        [points,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs font-medium" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "font-mono text-sm" },
        });
        (__VLS_ctx.points[1].lat.toFixed(6));
        (__VLS_ctx.points[1].lng.toFixed(6));
        // @ts-ignore
        [points, points,];
    }
    const __VLS_253 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }));
    const __VLS_255 = __VLS_254({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    let __VLS_257;
    let __VLS_258;
    const __VLS_259 = ({ click: {} },
        { onClick: (__VLS_ctx.copyCoordinates) });
    const { default: __VLS_260 } = __VLS_256.slots;
    // @ts-ignore
    [copyCoordinates,];
    {
        const { icon: __VLS_261 } = __VLS_256.slots;
        const __VLS_262 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({
            component: (__VLS_ctx.CopyOutline),
        }));
        const __VLS_264 = __VLS_263({
            component: (__VLS_ctx.CopyOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_263));
        // @ts-ignore
        [CopyOutline,];
    }
    var __VLS_256;
}
var __VLS_113;
var __VLS_42;
const __VLS_267 = {}.NTabPane;
/** @type {[typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, typeof __VLS_components.NTabPane, typeof __VLS_components.nTabPane, ]} */ ;
// @ts-ignore
NTabPane;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
    name: "results",
    tab: "Analysis Results",
}));
const __VLS_269 = __VLS_268({
    name: "results",
    tab: "Analysis Results",
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
const { default: __VLS_271 } = __VLS_270.slots;
if (__VLS_ctx.analysisResult) {
    // @ts-ignore
    [analysisResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4 space-y-6" },
    });
    const __VLS_272 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    NCard;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        ...{ class: "dark:bg-gray-900" },
    }));
    const __VLS_274 = __VLS_273({
        ...{ class: "dark:bg-gray-900" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    const { default: __VLS_276 } = __VLS_275.slots;
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "font-medium text-lg mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm" },
    });
    const __VLS_277 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
        type: (__VLS_ctx.getRoadTypeTagType(__VLS_ctx.analysisResult.roadType.value)),
        size: "medium",
        ...{ class: "mt-1" },
    }));
    const __VLS_279 = __VLS_278({
        type: (__VLS_ctx.getRoadTypeTagType(__VLS_ctx.analysisResult.roadType.value)),
        size: "medium",
        ...{ class: "mt-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_278));
    const { default: __VLS_281 } = __VLS_280.slots;
    // @ts-ignore
    [analysisResult, getRoadTypeTagType,];
    (__VLS_ctx.analysisResult.roadType.name);
    // @ts-ignore
    [analysisResult,];
    var __VLS_280;
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-1" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderStars(__VLS_ctx.analysisResult.quality)) }, null, null);
    // @ts-ignore
    [analysisResult, vHtml, renderStars,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-sm" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xl font-semibold mt-1" },
    });
    (__VLS_ctx.analysisResult.length);
    // @ts-ignore
    [analysisResult,];
    var __VLS_275;
    const __VLS_282 = {}.NCard;
    /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
    // @ts-ignore
    NCard;
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
        ...{ class: "dark:bg-gray-900" },
    }));
    const __VLS_284 = __VLS_283({
        ...{ class: "dark:bg-gray-900" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_283));
    const { default: __VLS_286 } = __VLS_285.slots;
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "font-medium text-lg mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-1 md:grid-cols-2 gap-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: "font-medium mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-between" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm" },
    });
    const __VLS_287 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent(__VLS_287, new __VLS_287({
        type: (__VLS_ctx.analysisResult.condition === 'Good' ? 'success' : 'warning'),
        size: "small",
    }));
    const __VLS_289 = __VLS_288({
        type: (__VLS_ctx.analysisResult.condition === 'Good' ? 'success' : 'warning'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    const { default: __VLS_291 } = __VLS_290.slots;
    // @ts-ignore
    [analysisResult,];
    (__VLS_ctx.analysisResult.condition);
    // @ts-ignore
    [analysisResult,];
    var __VLS_290;
    const __VLS_292 = {}.NProgress;
    /** @type {[typeof __VLS_components.NProgress, typeof __VLS_components.nProgress, ]} */ ;
    // @ts-ignore
    NProgress;
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
        percentage: (__VLS_ctx.analysisResult.condition === 'Good' ? 80 : 35),
        height: (8),
        indicatorPlacement: ('inside'),
        type: (__VLS_ctx.analysisResult.condition === 'Good' ? 'success' : 'warning'),
    }));
    const __VLS_294 = __VLS_293({
        percentage: (__VLS_ctx.analysisResult.condition === 'Good' ? 80 : 35),
        height: (8),
        indicatorPlacement: ('inside'),
        type: (__VLS_ctx.analysisResult.condition === 'Good' ? 'success' : 'warning'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    // @ts-ignore
    [analysisResult, analysisResult,];
    const __VLS_297 = {}.NDivider;
    /** @type {[typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, ]} */ ;
    // @ts-ignore
    NDivider;
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({}));
    const __VLS_299 = __VLS_298({}, ...__VLS_functionalComponentArgsRest(__VLS_298));
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: "font-medium mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
        ...{ class: "space-y-2" },
    });
    for (const [feature, i] of __VLS_getVForSourceType((__VLS_ctx.analysisResult.features))) {
        // @ts-ignore
        [analysisResult,];
        __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
            key: (i),
            ...{ class: "flex items-center" },
        });
        const __VLS_302 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
            component: (__VLS_ctx.CheckmarkCircleOutline),
            ...{ class: "mr-2 text-green-500" },
        }));
        const __VLS_304 = __VLS_303({
            component: (__VLS_ctx.CheckmarkCircleOutline),
            ...{ class: "mr-2 text-green-500" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_303));
        // @ts-ignore
        [CheckmarkCircleOutline,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-sm" },
        });
        (feature);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.h4, __VLS_elements.h4)({
        ...{ class: "font-medium mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "rounded-lg h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-center p-4" },
    });
    const __VLS_307 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_308 = __VLS_asFunctionalComponent(__VLS_307, new __VLS_307({
        component: (__VLS_ctx.ImageOutline),
        ...{ class: "text-4xl mb-2 text-gray-400" },
    }));
    const __VLS_309 = __VLS_308({
        component: (__VLS_ctx.ImageOutline),
        ...{ class: "text-4xl mb-2 text-gray-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_308));
    // @ts-ignore
    [ImageOutline,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-gray-500 dark:text-gray-400" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs mt-1" },
    });
    (__VLS_ctx.images.length);
    // @ts-ignore
    [images,];
    const __VLS_312 = {}.NDivider;
    /** @type {[typeof __VLS_components.NDivider, typeof __VLS_components.nDivider, ]} */ ;
    // @ts-ignore
    NDivider;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({}));
    const __VLS_314 = __VLS_313({}, ...__VLS_functionalComponentArgsRest(__VLS_313));
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-2" },
    });
    const __VLS_317 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
        ...{ 'onClick': {} },
        block: true,
        secondary: true,
    }));
    const __VLS_319 = __VLS_318({
        ...{ 'onClick': {} },
        block: true,
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    let __VLS_321;
    let __VLS_322;
    const __VLS_323 = ({ click: {} },
        { onClick: (__VLS_ctx.exportReport) });
    const { default: __VLS_324 } = __VLS_320.slots;
    // @ts-ignore
    [exportReport,];
    {
        const { icon: __VLS_325 } = __VLS_320.slots;
        const __VLS_326 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({
            component: (__VLS_ctx.DocumentTextOutline),
        }));
        const __VLS_328 = __VLS_327({
            component: (__VLS_ctx.DocumentTextOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_327));
        // @ts-ignore
        [DocumentTextOutline,];
    }
    var __VLS_320;
    const __VLS_331 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_332 = __VLS_asFunctionalComponent(__VLS_331, new __VLS_331({
        ...{ 'onClick': {} },
        block: true,
        secondary: true,
    }));
    const __VLS_333 = __VLS_332({
        ...{ 'onClick': {} },
        block: true,
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_332));
    let __VLS_335;
    let __VLS_336;
    const __VLS_337 = ({ click: {} },
        { onClick: (__VLS_ctx.viewOnMap) });
    const { default: __VLS_338 } = __VLS_334.slots;
    // @ts-ignore
    [viewOnMap,];
    {
        const { icon: __VLS_339 } = __VLS_334.slots;
        const __VLS_340 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
            component: (__VLS_ctx.MapOutline),
        }));
        const __VLS_342 = __VLS_341({
            component: (__VLS_ctx.MapOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_341));
        // @ts-ignore
        [MapOutline,];
    }
    var __VLS_334;
    var __VLS_285;
    if (__VLS_ctx.predictions.length) {
        // @ts-ignore
        [predictions,];
        const __VLS_345 = {}.NCard;
        /** @type {[typeof __VLS_components.NCard, typeof __VLS_components.nCard, typeof __VLS_components.NCard, typeof __VLS_components.nCard, ]} */ ;
        // @ts-ignore
        NCard;
        // @ts-ignore
        const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
            ...{ class: "dark:bg-gray-900" },
        }));
        const __VLS_347 = __VLS_346({
            ...{ class: "dark:bg-gray-900" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_346));
        const { default: __VLS_349 } = __VLS_348.slots;
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "font-medium text-lg mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "grid grid-cols-1 md:grid-cols-3 gap-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xl font-semibold mt-1" },
        });
        (__VLS_ctx.predictions.length);
        // @ts-ignore
        [predictions,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xl font-semibold mt-1 text-red-500 dark:text-red-400" },
        });
        (__VLS_ctx.predictions.filter(p => p.toLowerCase().includes('major')).length);
        // @ts-ignore
        [predictions,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "p-4 border rounded-lg dark:border-gray-700" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xl font-semibold mt-1 text-amber-500 dark:text-amber-400" },
        });
        (__VLS_ctx.predictions.filter(p => p.toLowerCase().includes('minor')).length);
        // @ts-ignore
        [predictions,];
        var __VLS_348;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center justify-center py-12 text-center" },
    });
    const __VLS_350 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
        component: (__VLS_ctx.AnalyticsOutline),
        ...{ class: "text-4xl mb-4 text-gray-400" },
    }));
    const __VLS_352 = __VLS_351({
        component: (__VLS_ctx.AnalyticsOutline),
        ...{ class: "text-4xl mb-4 text-gray-400" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_351));
    // @ts-ignore
    [AnalyticsOutline,];
    __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
        ...{ class: "text-xl font-medium mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-gray-500 dark:text-gray-400 max-w-md" },
    });
    const __VLS_355 = {}.NButton;
    /** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
    // @ts-ignore
    NButton;
    // @ts-ignore
    const __VLS_356 = __VLS_asFunctionalComponent(__VLS_355, new __VLS_355({
        ...{ 'onClick': {} },
        ...{ class: "mt-4" },
    }));
    const __VLS_357 = __VLS_356({
        ...{ 'onClick': {} },
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_356));
    let __VLS_359;
    let __VLS_360;
    const __VLS_361 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.analysisResult))
                    return;
                __VLS_ctx.activeTab = 'input';
                // @ts-ignore
                [activeTab,];
            } });
    const { default: __VLS_362 } = __VLS_358.slots;
    var __VLS_358;
}
var __VLS_270;
var __VLS_37;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "fixed bottom-0 left-0 right-0 py-3 px-6 shadow-lg border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center space-x-2 flex-wrap" },
});
const __VLS_363 = {}.NTag;
/** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
// @ts-ignore
NTag;
// @ts-ignore
const __VLS_364 = __VLS_asFunctionalComponent(__VLS_363, new __VLS_363({
    size: "small",
    bordered: (false),
}));
const __VLS_365 = __VLS_364({
    size: "small",
    bordered: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_364));
const { default: __VLS_367 } = __VLS_366.slots;
{
    const { icon: __VLS_368 } = __VLS_366.slots;
    const __VLS_369 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_370 = __VLS_asFunctionalComponent(__VLS_369, new __VLS_369({
        component: (__VLS_ctx.ImageOutline),
    }));
    const __VLS_371 = __VLS_370({
        component: (__VLS_ctx.ImageOutline),
    }, ...__VLS_functionalComponentArgsRest(__VLS_370));
    // @ts-ignore
    [ImageOutline,];
}
(__VLS_ctx.uploadedImagesCount);
(__VLS_ctx.uploadedImagesCount === 1 ? 'image' : 'images');
// @ts-ignore
[uploadedImagesCount, uploadedImagesCount,];
var __VLS_366;
if (__VLS_ctx.points.length) {
    // @ts-ignore
    [points,];
    const __VLS_374 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({
        size: "small",
        bordered: (false),
    }));
    const __VLS_376 = __VLS_375({
        size: "small",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_375));
    const { default: __VLS_378 } = __VLS_377.slots;
    {
        const { icon: __VLS_379 } = __VLS_377.slots;
        const __VLS_380 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
            component: (__VLS_ctx.LocationOutline),
        }));
        const __VLS_382 = __VLS_381({
            component: (__VLS_ctx.LocationOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_381));
        // @ts-ignore
        [LocationOutline,];
    }
    (__VLS_ctx.points.length);
    (__VLS_ctx.points.length === 1 ? 'point' : 'points');
    // @ts-ignore
    [points, points,];
    var __VLS_377;
}
if (__VLS_ctx.allData.length) {
    // @ts-ignore
    [allData,];
    const __VLS_385 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_386 = __VLS_asFunctionalComponent(__VLS_385, new __VLS_385({
        size: "small",
        bordered: (false),
    }));
    const __VLS_387 = __VLS_386({
        size: "small",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_386));
    const { default: __VLS_389 } = __VLS_388.slots;
    {
        const { icon: __VLS_390 } = __VLS_388.slots;
        const __VLS_391 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_392 = __VLS_asFunctionalComponent(__VLS_391, new __VLS_391({
            component: (__VLS_ctx.EyeOutline),
        }));
        const __VLS_393 = __VLS_392({
            component: (__VLS_ctx.EyeOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_392));
        // @ts-ignore
        [EyeOutline,];
    }
    (__VLS_ctx.allData.length);
    (__VLS_ctx.allData.length === 1 ? 'detection' : 'detections');
    // @ts-ignore
    [allData, allData,];
    var __VLS_388;
}
if (__VLS_ctx.liveMapData.length) {
    // @ts-ignore
    [liveMapData,];
    const __VLS_396 = {}.NTag;
    /** @type {[typeof __VLS_components.NTag, typeof __VLS_components.nTag, typeof __VLS_components.NTag, typeof __VLS_components.nTag, ]} */ ;
    // @ts-ignore
    NTag;
    // @ts-ignore
    const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
        size: "small",
        type: "success",
        bordered: (false),
    }));
    const __VLS_398 = __VLS_397({
        size: "small",
        type: "success",
        bordered: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_397));
    const { default: __VLS_400 } = __VLS_399.slots;
    {
        const { icon: __VLS_401 } = __VLS_399.slots;
        const __VLS_402 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
            component: (__VLS_ctx.PulseOutline),
        }));
        const __VLS_404 = __VLS_403({
            component: (__VLS_ctx.PulseOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_403));
        // @ts-ignore
        [PulseOutline,];
    }
    (__VLS_ctx.liveMapData.length);
    // @ts-ignore
    [liveMapData,];
    var __VLS_399;
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex space-x-3 w-full md:w-auto" },
});
const __VLS_407 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_408 = __VLS_asFunctionalComponent(__VLS_407, new __VLS_407({
    ...{ 'onClick': {} },
    tertiary: true,
    disabled: ((__VLS_ctx.images.length === 0 && __VLS_ctx.points.length === 0 && __VLS_ctx.allData.length === 0) || __VLS_ctx.isAnalyzing),
}));
const __VLS_409 = __VLS_408({
    ...{ 'onClick': {} },
    tertiary: true,
    disabled: ((__VLS_ctx.images.length === 0 && __VLS_ctx.points.length === 0 && __VLS_ctx.allData.length === 0) || __VLS_ctx.isAnalyzing),
}, ...__VLS_functionalComponentArgsRest(__VLS_408));
let __VLS_411;
let __VLS_412;
const __VLS_413 = ({ click: {} },
    { onClick: (__VLS_ctx.clearAllData) });
const { default: __VLS_414 } = __VLS_410.slots;
// @ts-ignore
[images, points, allData, isAnalyzing, clearAllData,];
{
    const { icon: __VLS_415 } = __VLS_410.slots;
    const __VLS_416 = {}.NIcon;
    /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
    // @ts-ignore
    NIcon;
    // @ts-ignore
    const __VLS_417 = __VLS_asFunctionalComponent(__VLS_416, new __VLS_416({
        component: (__VLS_ctx.TrashOutline),
    }));
    const __VLS_418 = __VLS_417({
        component: (__VLS_ctx.TrashOutline),
    }, ...__VLS_functionalComponentArgsRest(__VLS_417));
    // @ts-ignore
    [TrashOutline,];
}
var __VLS_410;
const __VLS_421 = {}.NButton;
/** @type {[typeof __VLS_components.NButton, typeof __VLS_components.nButton, typeof __VLS_components.NButton, typeof __VLS_components.nButton, ]} */ ;
// @ts-ignore
NButton;
// @ts-ignore
const __VLS_422 = __VLS_asFunctionalComponent(__VLS_421, new __VLS_421({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
    disabled: (__VLS_ctx.isAnalyzing || __VLS_ctx.uploadedImagesCount === 0 || __VLS_ctx.points.length === 0 || (__VLS_ctx.selectionMode === 'both' && __VLS_ctx.points.length < 2)),
}));
const __VLS_423 = __VLS_422({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
    disabled: (__VLS_ctx.isAnalyzing || __VLS_ctx.uploadedImagesCount === 0 || __VLS_ctx.points.length === 0 || (__VLS_ctx.selectionMode === 'both' && __VLS_ctx.points.length < 2)),
}, ...__VLS_functionalComponentArgsRest(__VLS_422));
let __VLS_425;
let __VLS_426;
const __VLS_427 = ({ click: {} },
    { onClick: (__VLS_ctx.handleAnalyze) });
const { default: __VLS_428 } = __VLS_424.slots;
// @ts-ignore
[selectionMode, points, points, uploadedImagesCount, isAnalyzing, isAnalyzing, handleAnalyze,];
{
    const { icon: __VLS_429 } = __VLS_424.slots;
    if (!__VLS_ctx.isAnalyzing) {
        // @ts-ignore
        [isAnalyzing,];
        const __VLS_430 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
            component: (__VLS_ctx.PlayOutline),
        }));
        const __VLS_432 = __VLS_431({
            component: (__VLS_ctx.PlayOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_431));
        // @ts-ignore
        [PlayOutline,];
    }
    else {
        const __VLS_435 = {}.NIcon;
        /** @type {[typeof __VLS_components.NIcon, typeof __VLS_components.nIcon, ]} */ ;
        // @ts-ignore
        NIcon;
        // @ts-ignore
        const __VLS_436 = __VLS_asFunctionalComponent(__VLS_435, new __VLS_435({
            ...{ class: "animate-spin" },
            component: (__VLS_ctx.RefreshOutline),
        }));
        const __VLS_437 = __VLS_436({
            ...{ class: "animate-spin" },
            component: (__VLS_ctx.RefreshOutline),
        }, ...__VLS_functionalComponentArgsRest(__VLS_436));
        // @ts-ignore
        [RefreshOutline,];
    }
}
(__VLS_ctx.isAnalyzing ? `Analyzing...` : 'Analyze');
// @ts-ignore
[isAnalyzing,];
var __VLS_424;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['!overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-dashed']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-blue-900']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-right']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-green-400']} */ ;
/** @type {__VLS_StyleScopedClasses['inline']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-32']} */ ;
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['filter']} */ ;
/** @type {__VLS_StyleScopedClasses['grayscale']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-60']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-20']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['left-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-2']} */ ;
/** @type {__VLS_StyleScopedClasses['right-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-0']} */ ;
/** @type {__VLS_StyleScopedClasses['group-hover:opacity-100']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['list-disc']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-fit']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-300']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['top-[25px]']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['!z-[900]']} */ ;
/** @type {__VLS_StyleScopedClasses['w-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['z-0']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
/** @type {__VLS_StyleScopedClasses['left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-blue-900/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-blue-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-green-900/20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-green-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['font-mono']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['h-48']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-3']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-red-400']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-amber-400']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-12']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
/** @type {__VLS_StyleScopedClasses['left-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-7xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex-row']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['md:w-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
// @ts-ignore
var __VLS_153 = __VLS_152;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        NCard: NCard,
        NButton: NButton,
        NTabs: NTabs,
        NTabPane: NTabPane,
        NSwitch: NSwitch,
        NInput: NInput,
        NProgress: NProgress,
        NIcon: NIcon,
        NTag: NTag,
        NAlert: NAlert,
        NDivider: NDivider,
        CloudUploadOutline: CloudUploadOutline,
        LocationOutline: LocationOutline,
        LocateOutline: LocateOutline,
        TrashOutline: TrashOutline,
        PlayOutline: PlayOutline,
        RefreshOutline: RefreshOutline,
        AnalyticsOutline: AnalyticsOutline,
        ImageOutline: ImageOutline,
        DocumentTextOutline: DocumentTextOutline,
        MapOutline: MapOutline,
        CheckmarkCircleOutline: CheckmarkCircleOutline,
        SearchOutline: SearchOutline,
        CopyOutline: CopyOutline,
        CloseOutline: CloseOutline,
        EyeOutline: EyeOutline,
        PulseOutline: PulseOutline,
        LMap: LMap,
        LTileLayer: LTileLayer,
        LMarker: LMarker,
        LPopup: LPopup,
        LPolyline: LPolyline,
        LControlZoom: LControlZoom,
        DetectionModal: DetectionModal,
        CoordinatePopup: CoordinatePopup,
        maxFiles: maxFiles,
        title: title,
        images: images,
        rejectedFiles: rejectedFiles,
        isUploading: isUploading,
        fileInput: fileInput,
        isDragOver: isDragOver,
        location: location,
        locationError: locationError,
        points: points,
        selectionMode: selectionMode,
        isAnalyzing: isAnalyzing,
        activeTab: activeTab,
        mapHeight: mapHeight,
        analysisResult: analysisResult,
        allData: allData,
        predictions: predictions,
        modalData: modalData,
        searchQuery: searchQuery,
        searchResults: searchResults,
        isSearching: isSearching,
        coordinatePopup: coordinatePopup,
        mapRef: mapRef,
        liveMapData: liveMapData,
        mapCenter: mapCenter,
        mapZoom: mapZoom,
        tileUrl: tileUrl,
        startIcon: startIcon,
        endIcon: endIcon,
        selectionModeBool: selectionModeBool,
        uploadedImagesCount: uploadedImagesCount,
        hasMarkers: hasMarkers,
        viewfullMap: viewfullMap,
        triggerFileSelect: triggerFileSelect,
        onDragOver: onDragOver,
        onDragLeave: onDragLeave,
        onDrop: onDrop,
        onFilesSelected: onFilesSelected,
        uploadAll: uploadAll,
        removeFile: removeFile,
        retryUpload: retryUpload,
        clearAll: clearAll,
        niceSize: niceSize,
        formatFileType: formatFileType,
        statusClass: statusClass,
        getRoadTypeTagType: getRoadTypeTagType,
        renderStars: renderStars,
        colorIcon: colorIcon,
        liveDataIcon: liveDataIcon,
        openModal: openModal,
        handleAnalyze: handleAnalyze,
        handleSearch: handleSearch,
        handleSearchResultClick: handleSearchResultClick,
        onMapClick: onMapClick,
        useCurrentLocation: useCurrentLocation,
        clearPoints: clearPoints,
        copyCoordinates: copyCoordinates,
        clearAllData: clearAllData,
        exportReport: exportReport,
        viewOnMap: viewOnMap,
        showFullMap: showFullMap,
        zoomUpdated: zoomUpdated,
        centerUpdated: centerUpdated,
        fitMapToMarkers: fitMapToMarkers,
        formatDate: formatDate,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
