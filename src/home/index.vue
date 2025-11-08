<template>
    <n-loading-bar-provider>
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
            <DetectionModal v-if="modalData" :modal-data="modalData" @close="handleModalClose()" />
            <CoordinatePopup v-if="coordinatePopup.visible" :popup="coordinatePopup"
                @close="coordinatePopup.visible = false" />

            <div class="relative h-screen w-full">
                <div class="absolute top-4 left-4 z-20 w-80 max-h-[90vh]">
                    <MapTools @search="handleSearch" @search-result-click="handleSearchResultClick"
                        @inspection-mode-toggle="handleInspectionModeToggle" @add-start-point="handleAddStartPoint"
                        @add-end-point="handleAddEndPoint" @inspection-complete="handleInspectionComplete"
                        @severity-filter-change="handleSeverityFilterChange"
                        @display-mode-change="handleDisplayModeChange" @time-range-change="handleTimeRangeChange"
                        @confidence-threshold-change="handleConfidenceThresholdChange" @home="handleHome" />
                </div>

                <div class="absolute inset-0 z-10">
                    <l-map :zoom="mapZoom" :center="mapCenter" :options="{ zoomControl: false }" class="w-full h-full"
                        @click="onMapClick" ref="mapRef" @update:zoom="zoomUpdated" @update:center="centerUpdated"
                        :use-global-leaflet="false">
                        <l-tile-layer :url="tileUrl" />
                        <l-control-zoom position="bottomright" />

                        <l-rectangle v-if="searchBoundary.bounds" :lat-lngs="searchBoundary.bounds"
                            :color="searchBoundary.color" :fill-color="searchBoundary.fillColor"
                            :fill-opacity="searchBoundary.fillOpacity" :weight="searchBoundary.weight">
                            <l-popup>
                                <div class="text-sm font-medium">{{ searchBoundary.name }}</div>
                                <div class="text-xs text-gray-600">Searched Location</div>
                            </l-popup>
                        </l-rectangle>

                        <l-rectangle v-if="inspectionArea.bounds" :lat-lngs="inspectionArea.bounds"
                            :color="inspectionArea.color" :fill-color="inspectionArea.fillColor"
                            :fill-opacity="inspectionArea.fillOpacity" :weight="inspectionArea.weight">
                            <l-popup>
                                <div class="text-sm font-medium">Inspection Area</div>
                                <div class="text-xs text-gray-600">
                                    {{ inspectionArea.roadName || 'Unnamed Road' }}
                                </div>
                            </l-popup>
                        </l-rectangle>

                        <l-marker v-if="points.length > 0" :lat-lng="points[0]" :icon="startIcon">
                            <l-popup>
                                <div class="text-sm font-medium">Start Point</div>
                                <div class="text-xs">Lat: {{ points[0].lat.toFixed(6) }}</div>
                                <div class="text-xs">Lng: {{ points[0].lng.toFixed(6) }}</div>
                            </l-popup>
                        </l-marker>

                        <l-marker v-if="points.length > 1" :lat-lng="points[1]" :icon="endIcon">
                            <l-popup>
                                <div class="text-sm font-medium">End Point</div>
                                <div class="text-xs">Lat: {{ points[1].lat.toFixed(6) }}</div>
                                <div class="text-xs">Lng: {{ points[1].lng.toFixed(6) }}</div>
                            </l-popup>
                        </l-marker>

                        <l-polyline v-if="points.length > 1" :lat-lngs="points" :color="'#3B82F6'" :weight="4"
                            :dash-array="'5, 5'" />

                        <l-marker v-for="(entry, i) in allData" :key="i"
                            :lat-lng="[entry.location.lat, entry.location.lng]" :icon="colorIcon(entry.label,entry.imageUrl)"
                            @click="openModal(entry)" />

                        <l-marker v-for="(liveData, i) in liveMapData" :key="'live-' + i"
                            :lat-lng="[liveData.location.lat, liveData.location.lng]" :icon="liveDataIcon(liveData)"
                            @click="openModal(liveData)">
                            <l-popup>
                                <div class="text-sm font-medium">{{ liveData.label }}</div>
                                <div class="text-xs">Detected: {{ formatDate(liveData.timestamp) }}</div>
                            </l-popup>
                        </l-marker>
                    </l-map>

                    <div class="absolute bottom-4 left-4 z-50 flex space-x-2">
                        <n-button circle @click="useCurrentLocation" title="Use current location">
                            <template #icon>
                                <n-icon :component="LocateOutline" />
                            </template>
                        </n-button>
                        <n-button circle @click="clearPoints" title="Clear points">
                            <template #icon>
                                <n-icon :component="TrashOutline" />
                            </template>
                        </n-button>
                        <n-button circle @click="fitMapToMarkers" title="Fit to markers" v-if="hasMarkers">
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                        </n-button>
                        <n-button circle @click="clearBoundaries" title="Clear boundaries" v-if="hasBoundaries">
                            <template #icon>
                                <n-icon :component="CloseOutline" />
                            </template>
                        </n-button>
                    </div>

                    <div
                        class="absolute top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-48">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Current View</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div>Lat: {{ mapCenter[0].toFixed(6) }}</div>
                            <div>Lng: {{ mapCenter[1].toFixed(6) }}</div>
                            <div>Zoom: {{ mapZoom }}</div>
                        </div>
                    </div>

                    <div v-if="hasBoundaries"
                        class="absolute top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-48">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Active Boundaries</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                            <div v-if="searchBoundary.bounds" class="flex items-center">
                                <div class="w-3 h-3 rounded-full mr-2"
                                    :style="{ backgroundColor: searchBoundary.color }"></div>
                                <span>Search Area</span>
                            </div>
                            <div v-if="inspectionArea.bounds" class="flex items-center">
                                <div class="w-3 h-3 rounded-full mr-2"
                                    :style="{ backgroundColor: inspectionArea.color }"></div>
                                <span>Inspection Area</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </n-loading-bar-provider>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useLoadingBar, useMessage, useDialog } from 'naive-ui'
import { LocateOutline, TrashOutline, EyeOutline, CloseOutline } from '@vicons/ionicons5'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline, LControlZoom, LRectangle } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { END_POINTS, getUserLocation, generateRoomId } from '@/utils/index.js'
import socket from "../socket/index.js"
import { useUserStore } from '../store/userStore.js'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import DetectionModal from "../update/DetectionModal.vue"
import MapTools from "./tools.vue"

dayjs.extend(relativeTime)

interface Point {
    lat: number
    lng: number
}

interface UserLocation {
    ip: string
    country: string
    countryCode: string
    region: string
    city: string
    latitude: number
    longitude: number
    isp?: string | null
}

interface LiveMapData {
    id: string
    label: string
    location: { lat: number; lng: number }
    timestamp: number
    severity: 'low' | 'medium' | 'high'
}

interface CoordinatePopup {
    visible: boolean
    position: any
    content: string
}

interface Boundary {
    bounds: L.LatLngBoundsLiteral | null
    color: string
    fillColor: string
    fillOpacity: number
    weight: number
    name?: string
    roadName?: string
}

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const loadingBar = useLoadingBar()
const messageApi = useMessage()
const { user } = useUserStore()

const roomId = generateRoomId()
socket.emit("joinRoom", "live-map-data-v1")
socket.emit("joinRoom", roomId)

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
})

const modalData = ref<any | null>(null)
const coordinatePopup = reactive<CoordinatePopup>({
    visible: false,
    position: null,
    content: ''
})
const mapRef = ref<any>(null)

const points = ref<Point[]>([])
const allData = ref<any[]>([])
const liveMapData = ref<LiveMapData[]>([])
const mapBounds = ref<L.LatLngBounds | null>(null)
const inspectionMode = ref(false)

const mapCenter = ref<[number, number]>([-0.71567, 37.14928])
const mapZoom = ref(12)
const tileUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

const searchBoundary = reactive<Boundary>({
    bounds: null,
    color: '#8B5CF6',
    fillColor: '#8B5CF6',
    fillOpacity: 0.1,
    weight: 3,
    name: ''
})

const inspectionArea = reactive<Boundary>({
    bounds: null,
    color: '#10B981',
    fillColor: '#10B981',
    fillOpacity: 0.15,
    weight: 3,
    roadName: ''
})

const startIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
})

const endIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776030.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
})

const hasMarkers = computed(() =>
    allData.value.length > 0 || liveMapData.value.length > 0 || points.value.length > 0
)

const hasBoundaries = computed(() =>
    searchBoundary.bounds !== null || inspectionArea.bounds !== null
)

const handleSearch = async (query: string) => {
    if (!query.trim()) {
        messageApi.warning('Please enter a search query')
        return
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&polygon_geojson=1`
        )
        const data = await response.json()

        if (data && data.length > 0) {
            searchResults.value = data
            messageApi.info(`Found "${data[0].display_name}". Click on it to view on map.`)
        } else {
            messageApi.warning('No locations found for your search')
        }
    } catch (error) {
        console.error('Search error:', error)
        messageApi.error('Search failed. Please try again.')
    }
}

const searchResults = ref<any[]>([])

const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    if (!isNaN(lat) && !isNaN(lng)) {
        mapCenter.value = [lat, lng]
        console.log("found serch",lat, lng)
        mapZoom.value = 14
        centerUpdated({lat,lng})

        const bounds = createBoundaryFromPoint(lat, lng, 0.02)
        searchBoundary.bounds = bounds
        searchBoundary.name = result.display_name

        getActiveMapDetections({ latitude: lat, longitude: lng })

        messageApi.success(`Showing ${result.display_name}`)
    }
}

const handleInspectionModeToggle = (mode: boolean) => {
    inspectionMode.value = mode
    if (!mode) {
        inspectionArea.bounds = null
        inspectionArea.roadName = ''
        points.value = []
    }
}

const handleAddStartPoint = () => {
    if (inspectionMode.value && points.value.length === 0) {
        messageApi.info('Click on the map to set start point')
    }
}

const handleAddEndPoint = () => {
    if (inspectionMode.value && points.value.length === 1) {
        messageApi.info('Click on the map to set end point')
    }
}

const handleInspectionComplete = (roadName?: string) => {
    if (points.value.length >= 2) {
        const bounds = createBoundaryFromPoints(points.value[0], points.value[1])
        inspectionArea.bounds = bounds
        inspectionArea.roadName = roadName || 'Inspection Route'

        if (mapRef.value?.mapObject) {
            const map = mapRef.value.mapObject
            const latLngBounds = L.latLngBounds(bounds)
            map.fitBounds(latLngBounds)
        }

        messageApi.success(`Inspection area created for ${roadName || 'the selected route'}`)
    }
}

const unfilteredData = ref<any[]>([])
const handleSeverityFilterChange = (severities: Array<'none' | 'minor' | 'major'>) => {

    if (!severities.length) {
        allData.value = [...unfilteredData.value]
        return
    }

    allData.value = unfilteredData.value.filter(data =>
        severities.includes(data.label)
    )

}

const handleDisplayModeChange = (mode: 'image' | 'icons') => {
      mapLabel.value = mode
}


const handleTimeRangeChange = (range: string) => {

  const now = dayjs()

  let threshold: dayjs.Dayjs | null = null

  switch (range) {
    case '24h':
      threshold = now.subtract(1, 'day')
      break
    case '1w':
      threshold = now.subtract(1, 'week')
      break
    case '1m':
      threshold = now.subtract(1, 'month')
      break
    case 'all':
    default:
      allData.value = [...unfilteredData.value]
      return
  }

  allData.value = unfilteredData.value.filter(data =>
    dayjs(data.created_at).isAfter(threshold)
  )

}


const handleConfidenceThresholdChange = (threshold: number) => {

    if (!threshold) {
        allData.value = [...unfilteredData.value]
        return
    }

    allData.value = unfilteredData.value.filter(data =>
        data.confidence * 100 >= threshold
    )

}

const handleHome = () => {
    mapCenter.value = [-0.71567, 37.14928]
    mapZoom.value = 12
    clearBoundaries()
    clearPoints()
}

function createBoundaryFromPoint(lat: number, lng: number, radius: number = 0.01): L.LatLngBoundsLiteral {
    return [
        [lat - radius, lng - radius],
        [lat + radius, lng + radius]
    ]
}

function createBoundaryFromPoints(start: Point, end: Point, padding: number = 0.005): L.LatLngBoundsLiteral {
    const lats = [start.lat, end.lat]
    const lngs = [start.lng, end.lng]

    return [
        [Math.min(...lats) - padding, Math.min(...lngs) - padding],
        [Math.max(...lats) + padding, Math.max(...lngs) + padding]
    ]
}

function clearBoundaries() {
    searchBoundary.bounds = null
    inspectionArea.bounds = null
    messageApi.info('All boundaries cleared')
}

function onMapClick(e: any) {
    const latlng = e.latlng
    if (!latlng) return

    if (inspectionMode.value && points.value.length < 2) {
        points.value.push({ lat: latlng.lat, lng: latlng.lng })

        if (points.value.length === 2) {
            const bounds = createBoundaryFromPoints(points.value[0], points.value[1])
            inspectionArea.bounds = bounds
            inspectionArea.roadName = 'Selected Inspection Area'
        }
    }

    coordinatePopup.visible = true
    coordinatePopup.position = latlng
    coordinatePopup.content = `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`

    getActiveMapDetections({
        latitude: latlng.lat,
        longitude: latlng.lng
    })
}

function useCurrentLocation() {
    if (!navigator.geolocation) {
        messageApi.error('Geolocation is not supported by your browser')
        return
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const newPos = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            }
            points.value = [newPos]
            mapCenter.value = [newPos.lat, newPos.lng]
            mapZoom.value = 15

            const bounds = createBoundaryFromPoint(newPos.lat, newPos.lng, 0.005)
            searchBoundary.bounds = bounds
            searchBoundary.name = 'Current Location'

            messageApi.success('Location updated to current position')
        },
        err => {
            messageApi.error('Failed to get current location')
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    )
}

function clearPoints() {
    points.value = []
    inspectionArea.bounds = null
    messageApi.info('Points and inspection area cleared')
}

function zoomUpdated(zoom: number) {
    mapZoom.value = zoom
}

function centerUpdated(center: L.LatLng) {
    mapCenter.value = [center.lat, center.lng]
}

function fitMapToMarkers() {
    if (!mapRef.value?.mapObject) return

    const map = mapRef.value.mapObject
    const group = new L.FeatureGroup()

    allData.value.forEach(item => {
        L.marker([item.location.lat, item.location.lng]).addTo(group)
    })

    liveMapData.value.forEach(item => {
        L.marker([item.location.lat, item.location.lng]).addTo(group)
    })

    points.value.forEach(point => {
        L.marker([point.lat, point.lng]).addTo(group)
    })

    if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1))
        messageApi.success('Map fitted to all markers')
    } else {
        messageApi.info('No markers to fit')
    }
}
const mapLabel = ref<'icons'|'image'>('icons')
function colorIcon(label: string, imageUrl?: string) {
  const color = getColorForLabel(label)

  if (mapLabel.value === 'icons') {
    // 🟢 Show colored circular icon
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background:${color};
          width:20px;
          height:20px;
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `
    })
  } else {
    // 🖼️ Show small image marker
    return L.divIcon({
      className: 'custom-image-icon',
      html: `
        <div style="
          width:28px;
          height:28px;
          border-radius:6px;
          overflow:hidden;
          border:3px solid ${color};
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          background:#fff;
        ">
          <img src="${imageUrl || ''}" style="width:100%;height:100%;object-fit:cover;">
        </div>
      `
    })
  }
}

function liveDataIcon(liveData: LiveMapData) {
    const colors = {
        low: '#10B981',
        medium: '#F59E0B',
        high: '#EF4444'
    }
    const color = colors[liveData.severity] || '#3B82F6'
    return L.divIcon({
        className: 'live-marker',
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`
    })
}

function getColorForLabel(label: string) {
    const normalized = (label || '').toLowerCase()
    if (normalized.includes('major')) return 'red'
    if (normalized.includes('minor')) return 'orange'
    return 'green'
}

function openModal(entry: any) {
    modalData.value = entry
    router.push({
        query: { detection: entry.id }
    })
}

function handleModalClose() {
    modalData.value = null
    router.push('/')
}

function handleConfirm() {
    dialog.warning({
        title: 'Authentication Required',
        content: 'You need to be logged in to modify data on this site.',
        positiveText: 'Login Now',
        negativeText: 'Cancel',
        draggable: true,
        onPositiveClick: () => {
            router.push('/auth/login')
        },
        onNegativeClick: () => {
            messageApi.info('You can log in anytime from the login page.')
        }
    })
}

const getActiveMapDetections = async (data: UserLocation): Promise<void> => {
    socket.emit("live_map_data", {
        room: roomId,
        coords: {
            lng: data.longitude,
            lat: data.latitude
        }
    })
}

function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
}

socket.on("live_map_data", (responseData: any) => {
    const detections = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
            ? responseData.data
            : []

    detections.forEach((detection: any) => {
        if (detection.location && detection.label) {
            allData.value.push(detection)
        }
    })

    if (detections.length > 0) {
        nextTick(() => {
            fitMapToMarkers()
        })
    }
    unfilteredData.value = allData.value

})

onMounted(() => {
    nextTick(() => {
        if (mapRef.value?.mapObject) {
            mapBounds.value = mapRef.value.mapObject.getBounds()
        }
    })

    getUserLocation().then((loc: UserLocation | null) => {
        if (loc) {
            mapCenter.value = [loc.latitude, loc.longitude]
            mapZoom.value = 15
            getActiveMapDetections(loc)
        }
    })

    if (route.query.detection) {
        modalData.value = { detection: route.query.detection }
    }
})

onUnmounted(() => {
    socket.emit("leaveRoom", "live-map-data-v1")
    socket.emit("leaveRoom", roomId)
})
</script>

<style scoped>
:deep(.leaflet-container) {
    font-family: inherit;
}

:deep(.custom-icon) {
    background: transparent !important;
    border: none !important;
}

:deep(.live-marker) {
    background: transparent !important;
    border: none !important;
}

:deep(.leaflet-marker-icon) {
    transition: transform 0.2s ease;
}

:deep(.leaflet-marker-icon:hover) {
    transform: scale(1.1);
}

:deep(.overflow-y-auto) {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
}

:deep(.overflow-y-auto::-webkit-scrollbar) {
    width: 6px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
    background: #f7fafc;
    border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: #cbd5e0;
    border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: #a0aec0;
}

.dark :deep(.overflow-y-auto) {
    scrollbar-color: #4a5568 #2d3748;
}

.dark :deep(.overflow-y-auto::-webkit-scrollbar-track) {
    background: #2d3748;
}

.dark :deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: #4a5568;
}

.dark :deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: #718096;
}
</style>