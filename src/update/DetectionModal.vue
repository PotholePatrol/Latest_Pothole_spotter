<script setup lang="ts">
import axios from 'axios'
import { ref, computed, watch, onMounted } from "vue"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

import {
  NImage,
  NSkeleton,
  NSpin,
  NButton,
  NTag,
  NCard,
  NGrid,
  NGi,
  NText,
  NThing,
  useMessage,
  useDialog
} from "naive-ui"
import { 
  CloseOutline,
  LocationOutline,
  TimeOutline,
  AnalyticsOutline,
  InformationCircleOutline,
  RefreshOutline,
  CheckmarkCircleOutline,
  WarningOutline,
  AlertCircleOutline,
  CameraOutline
} from '@vicons/ionicons5'

import { END_POINTS } from '../utils/index.js'

dayjs.extend(relativeTime)

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface ModalData {
  detection?: string;
  detectionId?: string;
  imageUrl?: string;
  label?: string;
  location?: Location;
  created_at?: string;
  confidence?: number;
  severity?: 'none' | 'minor' | 'major';
}

const props = defineProps<{
  modalData: ModalData | null;
}>()

const emit = defineEmits(["close"])

const messageApi = useMessage()
const dialogApi = useDialog()

const isLoadingData = ref(false)
const fromNow = ref(true)
const error = ref<string>('')
const isLoadingLocation = ref(false)
const locationName = ref<string>('')

const detectionDetails = ref<ModalData | null>(null)

// Computed properties
const activeDetection = computed(() => detectionDetails.value || props.modalData)
const currentDetectionId = computed(() => 
  props.modalData?.detection || props.modalData?.detectionId || 
  detectionDetails.value?.detection || detectionDetails.value?.detectionId
)

// Unified severity configuration
const severityConfig = computed(() => {
  const label = activeDetection.value?.label?.toLowerCase() || ''
  
  const configs = {
    major: { 
      level: 'major',
      color: '#ef4444',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: AlertCircleOutline,
      label: 'Major Issue',
      tagType: 'error' as const
    },
    minor: { 
      level: 'minor',
      color: '#f59e0b',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: WarningOutline,
      label: 'Minor Issue',
      tagType: 'warning' as const
    },
    none: { 
      level: 'none',
      color: '#10b981',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckmarkCircleOutline,
      label: 'No Issues',
      tagType: 'success' as const
    }
  }

  if (label.includes('major')) return configs.major
  if (label.includes('minor')) return configs.minor
  return configs.none
})

// Data metrics configuration
const metricsConfig = computed(() => [
  {
    key: 'confidence',
    label: 'Confidence',
    value: activeDetection.value?.confidence ? `${Math.round(activeDetection.value.confidence * 100)}%` : 'N/A',
    icon: AnalyticsOutline,
    color: activeDetection.value?.confidence 
      ? activeDetection.value.confidence >= 0.8 ? 'success' 
        : activeDetection.value.confidence >= 0.6 ? 'warning' : 'error'
      : 'default'
  },
  {
    key: 'timestamp',
    label: 'Detected',
    value: activeDetection.value?.created_at 
      ? (fromNow.value 
          ? dayjs(activeDetection.value.created_at).fromNow()
          : dayjs(activeDetection.value.created_at).format('D MMM YYYY, HH:mm'))
      : 'Unknown',
    icon: TimeOutline,
    color: 'default' as const
  }
])

// Unified data fetchers
const dataFetchers = {
  async getDetection(detectionId: string) {
    if (!detectionId) return
    
    isLoadingData.value = true
    error.value = ''

    try {
      const res = await axios.post(END_POINTS.FETCH_DETECTION(detectionId), { timeout: 15000 })
      detectionDetails.value = res.data
    } catch (err: any) {
      console.error('[FETCH DETECTION] error', err)
      error.value = err?.response?.data?.message || err?.request ? 'No response from server' : err.message || 'Failed to fetch details'
      messageApi.error('Failed to load detection details')
    } finally {
      isLoadingData.value = false
    }
  },

  async getLocationName(lat: number, lng: number) {
    if (!lat || !lng) return

    isLoadingLocation.value = true
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { timeout: 5000 }
      )

      const address = response.data.address
      if (address) {
        const parts = []
        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village)
        }
        if (address.state || address.country) {
          parts.push(address.state || address.country)
        }
        locationName.value = parts.join(', ')
      }
    } catch (err) {
      console.warn('Failed to fetch location name:', err)
      locationName.value = ''
    } finally {
      isLoadingLocation.value = false
    }
  }
}

// Router management
const routerManager = {
  updateQuery(detectionId: string) {
    const currentQuery = { ...route.query }
    router.push({ query: { ...currentQuery, detection: detectionId } })
  },

  clearDetection() {
    const { detection, ...restQuery } = route.query
    router.replace({ query: restQuery })
  }
}

// Event handlers
const eventHandlers = {
  handleBackgroundClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("detection-modal-overlay")) {
      emit("close")
    }
  },

  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') emit("close")
  },

  toggleTimeFormat() {
    fromNow.value = !fromNow.value
  }
}

// Watchers
watch(
  () => props.modalData,
  (newData) => {
    if (newData?.detection) {
      dataFetchers.getDetection(newData.detection)
      routerManager.updateQuery(newData.detection)
    } else if (newData?.detectionId) {
      dataFetchers.getDetection(newData.detectionId)
      routerManager.updateQuery(newData.detectionId)
    } else {
      detectionDetails.value = null
      if (route.query.detection) {
        routerManager.clearDetection()
      }
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => activeDetection.value?.location,
  (location) => {
    if (location?.lat && location?.lng) {
      dataFetchers.getLocationName(location.lat, location.lng)
    } else {
      locationName.value = ''
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  const routeDetectionId = route.query.detection as string
  
  if (routeDetectionId && !props.modalData) {
    dataFetchers.getDetection(routeDetectionId)
  }
  
  if (props.modalData?.detectionId && !route.query.detection) {
    routerManager.updateQuery(props.modalData.detectionId)
  }

  document.addEventListener('keydown', eventHandlers.handleKeydown)
})

// Helper computed properties
const formattedCoordinates = computed(() => {
  const loc = activeDetection.value?.location
  return loc ? `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}` : "Unknown"
})

const hasAdditionalDetails = computed(() => {
  return detectionDetails.value && Object.keys(detectionDetails.value).length > 1
})

const dataSourceInfo = computed(() => ({
  isLive: !!detectionDetails.value,
  icon: detectionDetails.value ? CheckmarkCircleOutline : InformationCircleOutline,
  color: detectionDetails.value ? 'text-green-500' : 'text-blue-500',
  label: detectionDetails.value ? 'Live data from server' : 'Using cached data'
}))
</script>

<template>
  <div
    class="detection-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
    @click="eventHandlers.handleBackgroundClick">
    
    <!-- Loading State -->
    <NSpin v-if="isLoadingData" size="large">
      <div class="flex flex-col items-center gap-4 p-8">
        <NSkeleton height="120px" width="120px" circle />
        <div class="space-y-2 w-48">
          <NSkeleton text size="medium" />
          <NSkeleton text width="60%" />
          <NSkeleton text width="80%" />
        </div>
      </div>
    </NSpin>

    <!-- Error State -->
    <NCard v-else-if="error" class="max-w-sm w-full" title="Error" segmented>
      <template #header-extra>
        <NButton quaternary circle @click="emit('close')">
          <template #icon>
            <n-icon :component="CloseOutline" />
          </template>
        </NButton>
      </template>

      <div class="text-center py-4">
        <n-icon :component="AlertCircleOutline" size="48" class="text-red-500 mx-auto mb-3" />
        <p class="text-red-500 dark:text-red-400 mb-4 text-sm">{{ error }}</p>
        <NButton type="primary" @click="dataFetchers.getDetection(currentDetectionId || '')">
          <template #icon>
            <n-icon :component="RefreshOutline" />
          </template>
          Retry
        </NButton>
      </div>
    </NCard>

    <!-- Main Content -->
    <NCard v-else-if="activeDetection"
      class="detection-modal max-w-md w-full max-h-[90vh] overflow-hidden"
      :title="activeDetection.label || 'Detection Analysis'" segmented
      :style="{ borderLeft: `4px solid ${severityConfig.color}` }">
      
      <template #header-extra>
        <NButton quaternary circle @click="emit('close')" size="small">
          <template #icon>
            <n-icon :component="CloseOutline" />
          </template>
        </NButton>
      </template>

      <div class="space-y-4">
        <!-- Severity Header -->
        <div class="flex items-center justify-between p-3 rounded-lg" 
             :class="[severityConfig.bgColor, severityConfig.borderColor, 'border']">
          <div class="flex items-center space-x-2">
            <n-icon :component="severityConfig.icon" :style="{ color: severityConfig.color }" />
            <span class="font-semibold text-sm">{{ severityConfig.label }}</span>
          </div>
          <NTag :type="severityConfig.tagType" size="small" round>
            {{ severityConfig.level.toUpperCase() }}
          </NTag>
        </div>

        <!-- Image Preview -->
        <div class="relative group">
          <NSkeleton v-if="!activeDetection.imageUrl" height="200px" width="100%" class="rounded-lg" />
          <NImage 
            v-else
            :src="activeDetection.imageUrl.replace(/\\/g, '/')" 
            :alt="activeDetection.label"
            class="modal-image w-full h-auto max-h-[220px] rounded-lg shadow-sm object-cover"
            :preview-disabled="false" 
            preview-src="" 
          />
          <div v-if="activeDetection.imageUrl"
            class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <NTag type="primary" size="small" class="backdrop-blur-sm">
              <template #icon>
                <n-icon :component="CameraOutline" />
              </template>
              Click to enlarge
            </NTag>
          </div>
        </div>

        <!-- Metrics Grid -->
        <NGrid :cols="2" :x-gap="8" :y-gap="8">
          <NGi v-for="metric in metricsConfig" :key="metric.key">
            <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                   :style="{ backgroundColor: `${severityConfig.color}15` }">
                <n-icon :component="metric.icon" :style="{ color: severityConfig.color }" size="14" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                  {{ metric.label }}
                </div>
                <NTag v-if="metric.color !== 'default'" :type="metric.color" size="small" class="mt-1">
                  {{ metric.value }}
                </NTag>
                <div v-else 
                     class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                     @click="metric.key === 'timestamp' && eventHandlers.toggleTimeFormat()">
                  {{ metric.value }}
                </div>
              </div>
            </div>
          </NGi>
        </NGrid>

        <!-- Location Information -->
        <div class="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
               :style="{ backgroundColor: `${severityConfig.color}15` }">
            <n-icon :component="LocationOutline" :style="{ color: severityConfig.color }" size="14" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Location</div>
            <NSpin v-if="isLoadingLocation" size="small" />
            <div v-else class="space-y-1">
              <div v-if="locationName" class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {{ locationName }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded truncate">
                {{ formattedCoordinates }}
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Details -->
        <div v-if="hasAdditionalDetails" class="space-y-2">
          <div class="flex items-center space-x-2 p-2">
            <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                 :style="{ backgroundColor: `${severityConfig.color}15` }">
              <n-icon :component="InformationCircleOutline" :style="{ color: severityConfig.color }" size="14" />
            </div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Details</div>
          </div>
          <div class="space-y-1 text-xs">
            <div 
              v-for="(value, key) in detectionDetails" 
              :key="key"
              v-if="!['detection', 'detectionId', 'imageUrl', 'label', 'location', 'created_at', 'confidence', 'severity'].includes(key) && value"
              class="flex justify-between items-center py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
              <span class="text-gray-600 dark:text-gray-400 capitalize truncate">
                {{ key.replace(/([A-Z])/g, ' $1').trim() }}
              </span>
              <span class="text-gray-800 dark:text-gray-200 font-medium ml-2 truncate text-right">
                {{ value }}
              </span>
            </div>
          </div>
        </div>

        <!-- Data Source Footer -->
        <div class="flex items-center justify-center space-x-1 pt-3 border-t border-gray-100 dark:border-gray-700">
          <n-icon :component="dataSourceInfo.icon" :class="dataSourceInfo.color" size="14" />
          <span class="text-xs text-gray-400 dark:text-gray-500">{{ dataSourceInfo.label }}</span>
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.detection-modal-overlay {
  backdrop-filter: blur(8px);
}

.detection-modal {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-image {
  transition: transform 0.2s ease;
}

.modal-image:hover {
  transform: scale(1.02);
}

:deep(.n-card__content) {
  padding: 16px;
}

:deep(.n-image) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.n-thing) {
  padding: 0;
}
</style>