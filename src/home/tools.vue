<template>
  <div class="min-h-screen bg-transparent">
    <div ref="mapContainer" class="w-full h-screen relative">
      <div class="absolute left-4 top-4 z-10 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 cursor-pointer" @click="emit('home')">
              <img :src="logoDark" alt="logo" class="h-12 w-auto" />
            </div>
            <n-badge :value="totalPotholes" type="info" />
          </div>
        </div>

        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="relative mb-3">
            <n-input 
              v-model:value="searchQuery" 
              placeholder="Search for a location..." 
              @keyup.enter="handleSearch"
              clearable 
              round
            >
              <template #suffix>
                <n-button text @click="handleSearch" :loading="isSearching">
                  <template #icon>
                    <n-icon :component="SearchOutline" />
                  </template>
                </n-button>
              </template>
            </n-input>

            <div 
              v-if="searchResults.length"
              class="absolute z-20 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto bg-white dark:bg-gray-800 border dark:border-gray-700"
            >
              <div 
                v-for="(r, i) in searchResults" 
                :key="i"
                class="p-3 cursor-pointer border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="handleSearchResultClick(r)"
              >
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ r.display_name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ r.type }}</div>
              </div>
            </div>
          </div>
        </div>

        <n-tabs type="segment" animated>
          <n-tab-pane name="Road Inspection" tab="Road Inspection">
            <div class="p-4">
              <h3 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">Road Inspection</h3>
              <div class="space-y-3">
                <n-button 
                  block 
                  :type="inspectionMode ? 'primary' : 'default'" 
                  @click="toggleInspectionMode"
                >
                  <template #icon>
                    <n-icon :component="inspectionMode ? StopCircleOutline : RoadMapOutline" />
                  </template>
                  {{ inspectionMode ? 'Stop Inspection' : 'Start Road Inspection' }}
                </n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="Start&stop" tab="Start & Stop Points">
            <div class="p-4">
              <div v-if="inspectionMode" class="space-y-2">
                <n-input 
                  v-model:value="roadName" 
                  placeholder="Road name (optional)" 
                  clearable 
                />
                <div class="flex gap-2">
                  <n-button 
                    block 
                    secondary 
                    @click="emit('add-start-point')" 
                    :disabled="!inspectionMode"
                  >
                    <template #icon>
                      <n-icon :component="LocationOutline" />
                    </template>
                    Start Point
                  </n-button>
                  <n-button 
                    block 
                    secondary 
                    @click="emit('add-end-point')" 
                    :disabled="!inspectionMode"
                  >
                    <template #icon>
                      <n-icon :component="FlagOutline" />
                    </template>
                    End Point
                  </n-button>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 py-4">
                Start road inspection to add points
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">Filters & Display</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity Level</label>
              <n-checkbox-group v-model:value="selectedSeverities">
                <n-space>
                  <n-checkbox value="major" label="Major" />
                  <n-checkbox value="minor" label="Minor" />
                  <n-checkbox value="none" label="None" />
                </n-space>
              </n-checkbox-group>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Display Mode</label>
              <n-switch 
                v-model:value="isHeatmapMode"
                @update:value="emit('display-mode-change', isHeatmapMode ? 'heatmap' : 'icons')"
              >
                <template #checked>Image</template>
                <template #unchecked>Icons</template>
              </n-switch>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Time Range</label>
              <n-select 
                v-model:value="timeRange" 
                :options="timeRangeOptions" 
                placeholder="Select time range"
                @update:value="emit('time-range-change', timeRange)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Minimum Confidence: {{ confidenceThreshold }}%
              </label>
              <n-slider 
                v-model:value="confidenceThreshold" 
                :step="3" 
                :min="30" 
                :max="100"
                @update:value="emit('confidence-threshold-change', confidenceThreshold)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import logoDark from '@/assets/pothole-logo.png'
import {
  NInput,
  NButton,
  NIcon,
  NBadge,
  NTabs,
  NTabPane,
  NCheckboxGroup,
  NCheckbox,
  NSelect,
  NSlider,
  NSwitch,
  NSpace,
  useMessage
} from 'naive-ui'
import {
  SearchOutline,
  LocationOutline,
  FlagOutline,
  StopCircleOutline,
  MapOutline as RoadMapOutline
} from '@vicons/ionicons5'

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

const emit = defineEmits<{
  'search': [query: string]
  'search-result-click': [result: SearchResult]
  'inspection-mode-toggle': [mode: boolean]
  'add-start-point': []
  'add-end-point': []
  'inspection-complete': [roadName?: string]
  'severity-filter-change': [severities: Array<'none' | 'minor' | 'major'>]
  'display-mode-change': [mode: 'image' | 'icons']
  'time-range-change': [range: string]
  'confidence-threshold-change': [threshold: number]
  'home': []
}>()

const mapContainer = ref<HTMLElement>()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const inspectionMode = ref(false)
const roadName = ref('')
const selectedSeverities = ref<Array<'none' | 'minor' | 'major'>>(['none', 'minor', 'major'])
const isHeatmapMode = ref(false)
const timeRange = ref<string>('all')
const confidenceThreshold = ref(30)

const potholes = ref([
  {
    id: '1',
    lat: -1.2921,
    lng: 36.8219,
    severity: 'high',
    confidence: 95,
    reportedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    lat: -1.2930,
    lng: 36.8230,
    severity: 'medium',
    confidence: 78,
    reportedAt: new Date('2024-01-14')
  }
])

const totalPotholes = computed(() => potholes.value.length)

const timeRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last Week', value: '1w' },
  { label: 'Last Month', value: '1m' }
]

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  emit('search', searchQuery.value)
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`
    )
    searchResults.value = await response.json()
  } catch (error) {
    console.error('Search failed:', error)
    useMessage().error('Search failed. Please try again.')
  } finally {
    isSearching.value = false
  }
}

const handleSearchResultClick = (result: SearchResult) => {
  searchQuery.value = result.display_name
  searchResults.value = []
  emit('search-result-click', result)
}

const toggleInspectionMode = () => {
  inspectionMode.value = !inspectionMode.value
  emit('inspection-mode-toggle', inspectionMode.value)
  
  if (!inspectionMode.value && roadName.value) {
    emit('inspection-complete', roadName.value)
    roadName.value = ''
    useMessage().success('Road inspection completed!')
  }
}

watch(selectedSeverities, (newSeverities) => {
  emit('severity-filter-change', newSeverities)
})

onMounted(() => {
  console.log('Map container initialized:', mapContainer.value)
})
</script>

<style scoped>
:deep(.n-card) {
  border-radius: 12px;
}

:deep(.n-button) {
  border-radius: 8px;
}

:deep(.n-input) {
  border-radius: 8px;
}

:deep(.n-tabs) {
  border-radius: 0;
}
</style>