<template>
  <n-loading-bar-provider>
    <div class="min-h-screen p-4 md:p-6 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
      :class="{ 'h-screen !overflow-hidden': viewfullMap }">
      <DetectionModal v-if="modalData" :modal-data="modalData" @close="handleModalClose()" />

      <CoordinatePopup v-if="coordinatePopup.visible" :popup="coordinatePopup"
        @close="coordinatePopup.visible = false" />

      <div class="max-w-7xl mx-auto">
        <header class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold">{{ title }}</h1>
              <p class="text-gray-600 dark:text-gray-400">
                Upload road images, select points, and analyze road conditions
              </p>
            </div>
            <n-button @click="showFullMap" secondary>
              <template #icon>
                <n-icon :component="MapOutline" />
              </template>
              View Full Map
            </n-button>
          </div>
        </header>

        <n-tabs v-model:value="activeTab" type="line" animated>
          <n-tab-pane name="input" tab="Data Input">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4" :class="{ 'flex': viewfullMap }">
              <n-card v-if="!viewfullMap" class="h-fit shadow-md border p-4 dark:bg-gray-900">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold">Road Images</h2>
                  <n-tag :type="images.length ? 'primary' : 'default'" round>
                    {{ images.length }} {{ images.length === 1 ? 'image' : 'images' }}
                  </n-tag>
                </div>

                <input ref="fileInput" type="file" multiple accept="image/*" @change="onFilesSelected" class="hidden" />

                <div
                  class="border-2 border-dashed rounded p-4 mb-4 transition-all hover:shadow-md cursor-pointer bg-white dark:bg-gray-800"
                  @click="triggerFileSelect" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop" :class="{ 'ring-2 ring-blue-400': isDragOver }">
                  <div class="flex items-center gap-3">
                    <button type="button" class="p-3 rounded-full bg-blue-50 dark:bg-blue-900"
                      @click.stop="triggerFileSelect">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5 5 5M12 5v12" />
                      </svg>
                    </button>

                    <div>
                      <div class="text-sm font-medium">Click to browse or drag & drop</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">Supports multiple images. Max {{ maxFiles }}
                        files.
                      </div>
                    </div>

                    <div class="ml-auto text-right">
                      <div v-if="location" class="text-sm text-green-700 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 mr-1" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                        </svg>
                        Lat {{ location.lat.toFixed(6) }}, Lng {{ location.lng.toFixed(6) }}
                      </div>
                      <div v-if="locationError" class="text-sm text-red-600 dark:text-red-400">{{ locationError }}</div>
                    </div>
                  </div>

                  <div v-if="rejectedFiles.length" class="mt-3 text-sm text-red-600">
                    Rejected: {{ rejectedFiles.join(', ') }}
                  </div>
                </div>

                <div v-if="images.length" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div v-for="(f, i) in images" :key="f.id"
                    class="relative border rounded-lg p-2 bg-white dark:bg-gray-800 transition-all hover:shadow-md group">
                    <div class="relative">
                      <img :src="f.preview" :alt="f.name" class="w-full h-32 object-cover rounded"
                        :class="{ 'filter grayscale opacity-60': !f.allowed || f.status === 'error' }" />
                      <div v-if="f.status === 'uploading'"
                        class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                        <n-progress type="line" :percentage="f.progress" :height="6" />
                      </div>
                      <div v-if="f.status === 'error'"
                        class="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                        <n-icon :component="CloseOutline" class="text-red-600 text-2xl" />
                      </div>
                    </div>
                    <div class="mt-2 text-sm">
                      <div class="font-medium truncate">{{ f.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileType(f.type) }} • {{
                        niceSize(f.size) }}</div>

                      <div class="mt-1 flex items-center">
                        <div :class="statusClass(f.status)" class="text-sm font-semibold flex-1">
                          {{ f.status }}
                        </div>
                        <n-button v-if="f.status === 'error'" text size="tiny" @click="retryUpload(i)">
                          <template #icon>
                            <n-icon :component="RefreshOutline" />
                          </template>
                          Retry
                        </n-button>
                      </div>
                    </div>

                    <div v-if="!f.allowed"
                      class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Invalid type</div>

                    <button
                      class="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full shadow"
                      @click="removeFile(i)">
                      <n-icon :component="CloseOutline" class="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    </button>
                  </div>
                </div>

                <n-alert v-if="rejectedFiles.length" type="error" class="mt-4" title="Some files were rejected:">
                  <ul class="list-disc ml-4">
                    <li v-for="(r, idx) in rejectedFiles" :key="idx">{{ r }}</li>
                  </ul>
                </n-alert>

                <div class="flex gap-3 mt-4">
                  <n-button :disabled="!images.length" @click="uploadAll" type="primary" :loading="isUploading">
                    <template #icon>
                      <n-icon :component="CloudUploadOutline" />
                    </template>
                    {{ isUploading ? 'Uploading...' : 'Upload All' }}
                  </n-button>
                  <n-button :disabled="!images.length" @click="clearAll" type="default">
                    Clear All
                  </n-button>
                </div>
              </n-card>

              <n-card class="h-fit shadow-md border dark:bg-gray-900 transition-all duration-300" :class="{
                'fixed inset-0 top-[25px] left-0 !z-[900] w-screen h-screen overflow-y-auto py-5': viewfullMap
              }">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold">Road Segment Selection</h2>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Mode:</span>
                    <n-switch v-model:value="selectionModeBool" checked-value="both" unchecked-value="single" />
                    <span class="text-sm">{{ selectionMode === 'both' ? 'Start & End Points' : 'Single Point' }}</span>
                  </div>
                </div>

                <div class="relative mb-4">
                  <n-input v-model:value="searchQuery" placeholder="Search for a location..."
                    @keyup.enter="handleSearch" clearable>
                    <template #suffix>
                      <n-button text @click="handleSearch" :loading="isSearching">
                        <template #icon>
                          <n-icon :component="SearchOutline" />
                        </template>
                      </n-button>
                    </template>
                  </n-input>

                  <div v-if="searchResults.length"
                    class="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <div v-for="(r, i) in searchResults" :key="i"
                      class="p-3 cursor-pointer border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      @click="handleSearchResultClick(r)">
                      <div class="font-medium">{{ r.display_name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ r.type }}</div>
                    </div>
                  </div>
                </div>

                <div :style="{ height: mapHeight }" class="relative z-0 rounded">
                  <l-map :zoom="mapZoom" :center="mapCenter" :options="{ zoomControl: false }"
                    style="height:100%; width:100%; border-radius: 0.5rem" @click="onMapClick" ref="mapRef"
                    @update:zoom="zoomUpdated" @update:center="centerUpdated" :use-global-leaflet="false">
                    <l-tile-layer :url="tileUrl" />

                    <l-control-zoom position="bottomright" />

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

                    <l-marker v-for="(entry, i) in allData" :key="i" :lat-lng="[entry.location.lat, entry.location.lng]"
                      :icon="colorIcon(entry.label)" @click="openModal(entry)" />

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
                  </div>
                </div>

                <div v-if="points.length" class="mt-4 space-y-2">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                      <p class="text-xs font-medium">Start Point</p>
                      <p class="font-mono text-sm">{{ points[0].lat.toFixed(6) }}, {{ points[0].lng.toFixed(6) }}</p>
                    </div>
                    <div v-if="points.length > 1"
                      class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                      <p class="text-xs font-medium">End Point</p>
                      <p class="font-mono text-sm">{{ points[1].lat.toFixed(6) }}, {{ points[1].lng.toFixed(6) }}</p>
                    </div>
                  </div>

                  <n-button text size="small" @click="copyCoordinates">
                    <template #icon>
                      <n-icon :component="CopyOutline" />
                    </template>
                    Copy Coordinates
                  </n-button>
                </div>
              </n-card>
            </div>
          </n-tab-pane>

          <n-tab-pane name="results" tab="Analysis Results">
            <div v-if="analysisResult" class="mt-4 space-y-6">
              <n-card class="dark:bg-gray-900">
                <h3 class="font-medium text-lg mb-4">Road Characteristics</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Road Type</p>
                    <n-tag :type="getRoadTypeTagType(analysisResult.roadType.value)" size="medium" class="mt-1">
                      {{ analysisResult.roadType.name }}
                    </n-tag>
                  </div>
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Quality Rating</p>
                    <div class="mt-1" v-html="renderStars(analysisResult.quality)"></div>
                  </div>
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Estimated Length</p>
                    <p class="text-xl font-semibold mt-1">{{ analysisResult.length }} km</p>
                  </div>
                </div>
              </n-card>

              <n-card class="dark:bg-gray-900">
                <h3 class="font-medium text-lg mb-4">Detailed Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-medium mb-2">Condition Assessment</h4>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-sm">Overall Condition</span>
                        <n-tag :type="analysisResult.condition === 'Good' ? 'success' : 'warning'" size="small">
                          {{ analysisResult.condition }}
                        </n-tag>
                      </div>
                      <n-progress :percentage="analysisResult.condition === 'Good' ? 80 : 35" :height="8"
                        :indicator-placement="'inside'"
                        :type="analysisResult.condition === 'Good' ? 'success' : 'warning'" />
                    </div>

                    <n-divider />

                    <h4 class="font-medium mb-2">Key Features</h4>
                    <ul class="space-y-2">
                      <li v-for="(feature, i) in analysisResult.features" :key="i" class="flex items-center">
                        <n-icon :component="CheckmarkCircleOutline" class="mr-2 text-green-500" />
                        <span class="text-sm">{{ feature }}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 class="font-medium mb-2">Visual Summary</h4>
                    <div class="rounded-lg h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div class="text-center p-4">
                        <n-icon :component="ImageOutline" class="text-4xl mb-2 text-gray-400" />
                        <p class="text-gray-500 dark:text-gray-400">Road analysis visualization</p>
                        <p class="text-xs mt-1">{{ images.length }} images processed</p>
                      </div>
                    </div>

                    <n-divider />

                    <div class="space-y-2">
                      <n-button block @click="exportReport" secondary>
                        <template #icon>
                          <n-icon :component="DocumentTextOutline" />
                        </template>
                        Export Report
                      </n-button>
                      <n-button block @click="viewOnMap" secondary>
                        <template #icon>
                          <n-icon :component="MapOutline" />
                        </template>
                        View on Map
                      </n-button>
                    </div>
                  </div>
                </div>
              </n-card>

              <n-card v-if="predictions.length" class="dark:bg-gray-900">
                <h3 class="font-medium text-lg mb-4">Detections Summary</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Total Detections</p>
                    <p class="text-xl font-semibold mt-1">{{ predictions.length }}</p>
                  </div>
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Major Issues</p>
                    <p class="text-xl font-semibold mt-1 text-red-500 dark:text-red-400">
                      {{predictions.filter(p => p.toLowerCase().includes('major')).length}}
                    </p>
                  </div>
                  <div class="p-4 border rounded-lg dark:border-gray-700">
                    <p class="text-sm">Minor Issues</p>
                    <p class="text-xl font-semibold mt-1 text-amber-500 dark:text-amber-400">
                      {{predictions.filter(p => p.toLowerCase().includes('minor')).length}}
                    </p>
                  </div>
                </div>
              </n-card>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <n-icon :component="AnalyticsOutline" class="text-4xl mb-4 text-gray-400" />
              <h3 class="text-xl font-medium mb-2">No Analysis Results</h3>
              <p class="text-gray-500 dark:text-gray-400 max-w-md">
                Run an analysis first to see detailed results about the road conditions and characteristics.
              </p>
              <n-button class="mt-4" @click="activeTab = 'input'">Go to Data Input</n-button>
            </div>
          </n-tab-pane>
        </n-tabs>

        <div
          class="fixed bottom-0 left-0 right-0 py-3 px-6 shadow-lg border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-2 flex-wrap">
              <n-tag size="small" :bordered="false">
                <template #icon>
                  <n-icon :component="ImageOutline" />
                </template>
                {{ uploadedImagesCount }} {{ uploadedImagesCount === 1 ? 'image' : 'images' }} uploaded
              </n-tag>
              <n-tag v-if="points.length" size="small" :bordered="false">
                <template #icon>
                  <n-icon :component="LocationOutline" />
                </template>
                {{ points.length }} {{ points.length === 1 ? 'point' : 'points' }}
              </n-tag>
              <n-tag v-if="allData.length" size="small" :bordered="false">
                <template #icon>
                  <n-icon :component="EyeOutline" />
                </template>
                {{ allData.length }} {{ allData.length === 1 ? 'detection' : 'detections' }}
              </n-tag>
              <n-tag v-if="liveMapData.length" size="small" type="success" :bordered="false">
                <template #icon>
                  <n-icon :component="PulseOutline" />
                </template>
                {{ liveMapData.length }} live
              </n-tag>
            </div>

            <div class="flex space-x-3 w-full md:w-auto">
              <n-button tertiary @click="clearAllData"
                :disabled="(images.length === 0 && points.length === 0 && allData.length === 0) || isAnalyzing">
                <template #icon>
                  <n-icon :component="TrashOutline" />
                </template>
                Clear All
              </n-button>
              <n-button type="primary" :loading="isAnalyzing"
                :disabled="isAnalyzing || uploadedImagesCount === 0 || points.length === 0 || (selectionMode === 'both' && points.length < 2)"
                @click="handleAnalyze">
                <template #icon>
                  <n-icon v-if="!isAnalyzing" :component="PlayOutline" />
                  <n-icon v-else class="animate-spin" :component="RefreshOutline" />
                </template>
                {{ isAnalyzing ? `Analyzing...` : 'Analyze' }}
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-loading-bar-provider>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, h, nextTick, watch } from 'vue'
import { useLoadingBar } from 'naive-ui'
import {
  NCard, NButton, NTabs, NTabPane, NSwitch, NInput, NProgress, NIcon, NTag, NAlert, NDivider, useMessage, useDialog
} from 'naive-ui'
import {
  CloudUploadOutline, LocationOutline, LocateOutline, TrashOutline, PlayOutline,
  RefreshOutline, AnalyticsOutline, ImageOutline, DocumentTextOutline, MapOutline,
  CheckmarkCircleOutline, SearchOutline, CopyOutline, CloseOutline, EyeOutline, PulseOutline
} from '@vicons/ionicons5'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline, LControlZoom } from '@vue-leaflet/vue-leaflet'
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
import DetectionModal from "./DetectionModal.vue"
import CoordinatePopup from "./CoordinatePopup.vue"
dayjs.extend(relativeTime)
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const loadingBar = useLoadingBar()

type Point = { lat: number; lng: number }
type AnalysisResult = any
type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

interface ImageEntry {
  id: number
  file: File
  name: string
  size: number
  type: string
  preview: string
  allowed: boolean
  status: UploadStatus
  progress: number
  xhr: XMLHttpRequest | null
}

interface UserLocation {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp?: string | null;
}

interface LiveMapData {
  id: string;
  label: string;
  location: { lat: number; lng: number };
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

const { user } = useUserStore()
const roomId = generateRoomId()

// Initialize socket connections
socket.emit("joinRoom", "live-map-data-v1")
socket.emit("joinRoom", roomId)

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'
const maxFiles = 5
const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

// Reactive state
const title = ref('SmartRoads System')
const images = ref<ImageEntry[]>([])
const rejectedFiles = ref<string[]>([])
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
let idCounter = 0

const location = ref<Point | null>(null)
const locationError = ref<string | null>(null)
const points = ref<Point[]>([])
const selectionMode = ref<'single' | 'both'>('single')
const isAnalyzing = ref(false)
const progress = ref(0)
const activeTab = ref<'input' | 'results'>('input')
const mapHeight = ref('6000px')
const analysisResult = ref<AnalysisResult | null>(null)
const allData = ref<any[]>([])
const predictions = ref<string[]>([])
const modalData = ref<any | null>(null)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const coordinatePopup = reactive({ visible: false, position: null as any, content: '' })
const showFullMapButton = ref(false)
const mapRef = ref<any>(null)
const liveMapData = ref<LiveMapData[]>([])
const mapBounds = ref<L.LatLngBounds | null>(null)

// Map configuration
// const mapCenter = ref<[number, number]>([-1.2921, 36.8219]) // Nairobi, Kenya
const mapCenter = ref<[number, number]>([-0.71567, 37.14928]) // murang'a, Kenya

const mapZoom = ref(12)
const tileUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

// Icons
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

const messageApi = useMessage()

// Computed properties
const selectionModeBool = computed({
  get: () => selectionMode.value === 'both',
  set: (v: boolean) => {
    selectionMode.value = v ? 'both' : 'single'
    if (!v) points.value = points.value.slice(0, 1)
  }
})

const uploadedImagesCount = computed(() => images.value.filter(i => i.status === 'success').length)
// const hasFilesToUpload = computed(() => images.value.some(i => i.status === 'pending' || i.status === 'error'))
const hasMarkers = computed(() => allData.value.length > 0 || liveMapData.value.length > 0 || points.value.length > 0)

// File handling functions


const viewfullMap = ref(route.query.map === "true")

// watch the route itself
watch(
  () => route.query.map,
  (val) => {
    viewfullMap.value = val === "true"
    if (viewfullMap.value) {
      mapHeight.value = window.innerHeight + "px"
    } else {
      mapHeight.value = window.innerWidth < 768 ? "300px" : "500px";

    }
  },
  { immediate: true } // run once on mount
)

watch(
  () => route.query.detection,
  (val) => {
    if (val) {
      modalData.value = { detection: val }
    }
  },
  { immediate: true } // run once on mount
)


function triggerFileSelect() {
  fileInput.value?.click()
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

function handleModalClose() {
  modalData.value = null
  router.push('/manual-train')
}


function onDragOver() { isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const dt = e.dataTransfer
  if (!dt) return
  if (dt.files && dt.files.length) addFiles(dt.files)
}

function addFiles(fileList: FileList | File[]) {
  const list = Array.from(fileList as any as File[])
  rejectedFiles.value = []

  for (const file of list) {
    if (images.value.length >= maxFiles) {
      rejectedFiles.value.push(`${file.name} (max ${maxFiles} files)`)
      continue
    }
    const allowed = acceptedTypes.includes(file.type) || file.type.startsWith('image/')
    if (!allowed) {
      rejectedFiles.value.push(`${file.name} (type not allowed)`)
      continue
    }

    const preview = URL.createObjectURL(file)
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
    })
  }
}

async function onFilesSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target?.files?.length) return
  const list = Array.from(target.files)

  try {
    const dev = await getDeviceLocation()
    location.value = dev
  } catch (err: any) {
    location.value = null
    locationError.value = err?.message ?? String(err)
  }

  addFiles(list)
  messageApi.success(`${list.length} image(s) added`)
  if (fileInput.value) fileInput.value.value = ''
}

// Upload functions
function uploadFile(index: number) {
  const entry = images.value[index]
  if (!entry || !entry.allowed) return

  entry.status = 'uploading'
  entry.progress = 0

  const xhr = new XMLHttpRequest()
  entry.xhr = xhr

  xhr.open('POST', END_POINTS.UPLOAD_URL, true)

  xhr.upload.onprogress = function (ev) {
    if (ev.lengthComputable) {
      entry.progress = (ev.loaded / ev.total) * 100
    }
  }

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      entry.progress = 100
      entry.status = 'success'
      entry.xhr = null
    } else {
      entry.status = 'error'
      entry.xhr = null
      loadingBar.error()
    }
  }

  xhr.onerror = function () {
    entry.status = 'error'
    entry.xhr = null
    loadingBar.error()
  }

  const form = new FormData()
  form.append('file', entry.file)
  if (location.value) {
    form.append('lat', String(location.value.lat))
    form.append('lng', String(location.value.lng))
  }

  xhr.send(form)
}

async function uploadAll() {
  isUploading.value = true
  for (let i = 0; i < images.value.length; i++) {
    if (images.value[i].status === 'pending' || images.value[i].status === 'error') {
      uploadFile(i)
      await waitForFinish(i)
    }
  }
  isUploading.value = false
}

function waitForFinish(index: number) {
  return new Promise<void>(resolve => {
    const entry = images.value[index]
    if (!entry) return resolve()
    const interval = setInterval(() => {
      if (!entry || (entry.status !== 'uploading' && entry.status !== 'pending')) {
        clearInterval(interval)
        resolve()
      }
    }, 200)
  })
}

function removeFile(index: number) {
  const entry = images.value[index]
  if (!entry) return
  if (entry.xhr) {
    try { entry.xhr.abort() } catch (e) { }
  }
  try { URL.revokeObjectURL(entry.preview) } catch (e) { }
  images.value.splice(index, 1)
}

function retryUpload(index: number) {
  const entry = images.value[index]
  if (!entry) return
  entry.status = 'pending'
  entry.progress = 0
  uploadFile(index)
}

function clearAll() {
  for (let i = images.value.length - 1; i >= 0; i--) removeFile(i)
  rejectedFiles.value = []
}

function niceSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatFileType(type: string) { return type.split('/')[1]?.toUpperCase() || 'IMAGE' }
function statusClass(s: UploadStatus | string) {
  if (s === 'success') return 'text-green-600'
  if (s === 'uploading') return 'text-blue-600'
  if (s === 'error') return 'text-red-600'
  return 'text-gray-600'
}

// Map and analysis functions
function getRoadTypeTagType(roadType: string) {
  const types: Record<string, string> = {
    highway: 'error',
    primary: 'warning',
    secondary: 'info',
    tertiary: 'success',
    residential: 'default',
    unpaved: 'default'
  }
  return types[roadType] || 'default'
}

function getColorForLabel(label: string) {
  const normalized = (label || '').toLowerCase()
  if (normalized.includes('major')) return 'red'
  if (normalized.includes('minor')) return 'orange'
  return 'green'
}

function renderStars(count: number) {
  const filled = '★'.repeat(count)
  const empty = '☆'.repeat(Math.max(0, 5 - count))
  return `<span class="text-yellow-400">${filled}</span><span class="text-gray-300 dark:text-gray-600">${empty}</span>`
}

function colorIcon(label: string) {
  const color = getColorForLabel(label)
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background:${color};width:20px;height:20px;border-radius:50%"></div>`
  })
}

function liveDataIcon(liveData: LiveMapData) {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  }
  const color = colors[liveData.severity] || 'blue'
  return L.divIcon({
    className: 'live-marker',
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`
  })
}

function openModal(entry: any) {
  modalData.value = entry
  router.push({
    query: {
      detection: entry.id,
    },
  })
}

async function getDeviceLocation(): Promise<Point> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported.'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

async function analyzeSingleImage(file: File, userId: string | null, coords: Point) {
  if (!user?.id) {
    handleConfirm()
    return
  }
  const form = new FormData()
  if (userId) form.append('userId', userId)
  form.append('image', file)
  form.append('lat', String(coords.lat))
  form.append('lng', String(coords.lng))

  try {
    const res = await fetch(END_POINTS.API_ENDPOINT, { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || 'Analysis failed')
      loadingBar.error()
    }
    //sctivate the popup modal 

    return await res.json()
  } catch (err: any) {
    console.error('API Error:', err)
    messageApi.error('Analysis Error: ' + (err?.message || 'Failed to analyze image'))
    loadingBar.error()
    return null
  }
}

async function analyzeImages() {
  const coords = points.value.length ? points.value[0] : { lat: mapCenter.value[0], lng: mapCenter.value[1] }
  const results: any[] = []

  for (let i = 0; i < images.value.length; i++) {
    const file = images.value[i].file
    try {
      const data = await analyzeSingleImage(file, user?.id || null, coords)
      if (data) {
        results.push(data)
        progress.value = ((i + 1) / images.value.length) * 100
        modalData.value = { detection: data.detectionId }
        router.push({ path: '/', query: { detection: data.detectionId } })
      }
    } catch (err) {
      console.error(err)
    }
  }
  return results
}

const roadTypes = [
  { name: 'Highway', value: 'highway', color: 'bg-red-100 text-red-800' },
  { name: 'Primary Road', value: 'primary', color: 'bg-orange-100 text-orange-800' },
  { name: 'Secondary Road', value: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Tertiary Road', value: 'tertiary', color: 'bg-green-100 text-green-800' },
  { name: 'Residential', value: 'residential', color: 'bg-blue-100 text-blue-800' },
  { name: 'Unpaved', value: 'unpaved', color: 'bg-gray-100 text-gray-800' }
]

function processAnalysisResults(results: any[]) {
  const randomRoadType = roadTypes[Math.floor(Math.random() * roadTypes.length)]
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
  }

  analysisResult.value = result
  allData.value = [...allData.value, ...results]
  predictions.value = [...predictions.value, ...results.map(r => r.label)]
}

async function handleAnalyze() {
  if (!user?.id) {
    handleConfirm()
    return
  }
  if (!validateAnalysisInputs()) return

  const pendingUploads = images.value.filter(f => f.status !== 'success')
  if (pendingUploads.length > 0) {
    messageApi.warning('Please upload all images before analyzing')
    return
  }
  loadingBar.start()

  isAnalyzing.value = true
  progress.value = 0
  analysisResult.value = null

  try {
    const res = await analyzeImages()
    // console.log("res:", res)
    if (res.length) processAnalysisResults(res)
    messageApi.success('Analysis Complete!')

  } catch (err) {
    console.error(err)
    messageApi.error('Analysis failed')
    loadingBar.error()
  } finally {
    isAnalyzing.value = false
    loadingBar.finish()
  }
}

function validateAnalysisInputs() {
  if (!images.value.length) { messageApi.error('Please upload at least one image'); return false }
  if (!points.value.length) { messageApi.error('Please select at least one point on the map'); return false }
  if (selectionMode.value === 'both' && points.value.length < 2) { messageApi.error('Please select both start and end points'); return false }
  return true
}

// Map and search functions
async function handleSearch() {
  if (!searchQuery.value.trim()) { messageApi.warning('Please enter a location'); return }
  isSearching.value = true
  try {
    const res = await fetch(`${NOMINATIM_API}?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=5`)
    const data = await res.json()
    searchResults.value = data
    if (data.length) {
      mapCenter.value = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      mapZoom.value = 14
      messageApi.success(`Showing results for ${data[0].display_name}`)
    } else {
      messageApi.info('No locations found')
    }
  } catch (err) {
    console.error(err)
    messageApi.error('Search Error')
  } finally { isSearching.value = false }
}

function handleSearchResultClick(result: any) {
  // Update map center and zoom to focus on the clicked suggestion
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)

  getActiveMapDetections({ latitude: lat, longitude: lng })

  if (!isNaN(lat) && !isNaN(lng)) {
    mapCenter.value = [lat, lng]
    mapZoom.value = 16 // zoom in when selecting
    searchResults.value = [] // close dropdown
    searchQuery.value = result.display_name // put chosen text in input
  } else {
    messageApi.error("Invalid location data")
  }
}



function onMapClick(e: any) {
  const latlng = e.latlng
  if (!latlng) return
  if (selectionMode.value === 'single') points.value = [{ lat: latlng.lat, lng: latlng.lng }]
  else {
    if (points.value.length < 2) points.value.push({ lat: latlng.lat, lng: latlng.lng })
    else points.value = [points.value[0], { lat: latlng.lat, lng: latlng.lng }]
  }

  coordinatePopup.visible = true
  coordinatePopup.position = latlng
  coordinatePopup.content = `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`
  getActiveMapDetections({ latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) })

}

function useCurrentLocation() {
  navigator.geolocation?.getCurrentPosition(
    pos => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      if (selectionMode.value === 'single') points.value = [newPos]
      else if (!points.value.length) points.value = [newPos]
      else points.value = [points.value[0], newPos]
      mapCenter.value = [newPos.lat, newPos.lng]
      mapZoom.value = 15
    },
    err => { messageApi.error('Failed to get location') }
  )
}

function clearPoints() { points.value = [] }

function copyCoordinates() {
  const coords = points.value.map(p => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`).join(' to ')
  navigator.clipboard.writeText(coords)
  messageApi.info('Coordinates copied to clipboard')
}

function clearAllData() {
  clearAll()
  points.value = []
  analysisResult.value = null
  allData.value = []
  predictions.value = []
  searchQuery.value = ''
  searchResults.value = []
  messageApi.info('All data has been reset')
}

function exportReport() { messageApi.info('Export not implemented in this template') }

function viewOnMap() {
  activeTab.value = 'input'
  if (points.value.length && mapRef.value?.mapObject) {
    nextTick(() => {
      mapRef.value.mapObject.flyTo([points.value[0].lat, points.value[0].lng], 15)
    })
  }
}

function showFullMap() {
  const url = window.location.origin + window.location.pathname + '?map=true'
  // window.open(url, '_blank')
  router.push({
    path: "/",
    query: {
      map: 'true'
    }
  })

}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  showFullMapButton.value = urlParams.get('map') !== 'true'
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

  // Add analysis markers
  allData.value.forEach(item => {
    L.marker([item.location.lat, item.location.lng]).addTo(group)
  })

  // Add live data markers
  liveMapData.value.forEach(item => {
    L.marker([item.location.lat, item.location.lng]).addTo(group)
  })

  // Add points if any
  points.value.forEach(point => {
    L.marker([point.lat, point.lng]).addTo(group)
  })

  if (group.getLayers().length > 0) {
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// Socket event handlers
const getActiveMapDetections = async (data: UserLocation): Promise<void> => {
  socket.emit("live_map_data", {
    room: roomId,
    coords: {
      lng: data.longitude,
      lat: data.latitude
    }
  })
}

// Listen for live map data
socket.on("live_map_data", (responseData: any) => {
  // console.log("📡 Live map data:", responseData)

  const detections = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : []

  detections.forEach((detection: any) => {
    // console.log(detection)
    processAnalysisResults([detection])

  })

  // Auto-fit map to markers if we're in results view
  if (activeTab.value === 'results' && liveMapData.value.length > 0) {
    nextTick(() => {
      fitMapToMarkers()
    })
  }
})


// Handle map height on resize
function handleResize(): void {
  if (typeof window === "undefined") return;
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
  getUserLocation().then((loc: UserLocation | null) => {
    if (loc) {
      // console.log("🌍 User location:", loc);
      mapCenter.value = [loc.latitude, loc.longitude]
      mapZoom.value = 15
      searchQuery.value = loc.city
      getActiveMapDetections(loc)
    }
  })

  // Initialize map bounds
  nextTick(() => {
    if (mapRef.value?.mapObject) {
      mapBounds.value = mapRef.value.mapObject.getBounds()
    }
  })
})

onUnmounted(() => {
  images.value.forEach(p => {
    try { URL.revokeObjectURL(p.preview) } catch (e) { }
    if (p.xhr) { try { p.xhr.abort() } catch (e) { } }
  })
  if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize)

  // Leave socket rooms
  socket.emit("leaveRoom", "live-map-data-v1")
  socket.emit("leaveRoom", roomId)
})


</script>

<style scoped>
.custom-icon,
.live-marker {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  line-height: 1.4;
}

.image-preview {
  transition: all 0.3s ease;
}

.image-preview:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>