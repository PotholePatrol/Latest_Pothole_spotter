<script setup lang="ts">
import {
  Road as FaRoad,
  CarCrash as FaCarCrash,
  ChartLine as FaChartLine,
  MapMarkedAlt as FaMapMarkedAlt,
  Users as FaUsers,
  Lightbulb as FaLightbulb
} from '@vicons/fa'
import { NButton, useMessage } from 'naive-ui'
import { Play as PlayIcon, Pause as PauseIcon, VolumeMute as VolumeMuteIcon, VolumeHigh as VolumeHighIcon } from '@vicons/ionicons5'
import { ref } from 'vue'

interface Feature {
  name: string
  description: string
  icon: any
}

let aboutVideo = null

try {
  // aboutVideo = (await import('../assets/MicrosoftTeams-video.mp4')).default
} catch {}

// 🔹 State management
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(true)
const isMuted = ref(true)

const togglePlay = () => {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !isMuted.value
  isMuted.value = !isMuted.value
}

const features: Feature[] = [
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
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">

    <!-- Hero -->
    <div
      class="relative bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-800 dark:to-gray-700 text-white py-20 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500 dark:bg-amber-600 blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-blue-400 dark:bg-blue-500 blur-3xl"></div>
      </div>
      <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">About Pothole Spotter</h1>
        <p class="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
          Revolutionizing road maintenance through AI-powered pothole detection and smart infrastructure monitoring
        </p>
      </div>
    </div>

    <!-- Video -->
    <div class="w-full relative">
      <video
        ref="videoRef"
        :src="aboutVideo"
        class="w-full h-auto shadow-lg"
        autoplay
        loop
        muted
        playsinline
      />
      <!-- Play/Pause Button -->
      <NButton
        type="primary"
        round
        size="small"
        class="absolute bottom-4 right-14 bg-gray-600 mr-3"
        @click="togglePlay"
      >
        <template #icon>
          <n-icon>
            <component :is="isPlaying ? PauseIcon : PlayIcon" />
          </n-icon>
        </template>
      </NButton>

      <NButton
        tertiary
        round
        size="small"
        class="absolute bottom-4 right-4 bg-gray-600/40"
        @click="toggleMute"
      >
        <template #icon>
          <n-icon>
            <component :is="isMuted ? VolumeMuteIcon : VolumeHighIcon" />
          </n-icon>
        </template>
      </NButton>
    </div>

    <section class="py-16 bg-white dark:bg-gray-800 transition-colors">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h2 class="text-base text-amber-500 font-semibold tracking-wide uppercase">Our Mission</h2>
        <p class="mt-2 text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white">
          Ensuring safer roads for everyone
        </p>
        <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
          We're committed to reducing road accidents and maintenance costs by providing real-time, accurate pothole
          detection and analytics.
        </p>
      </div>

      <div class="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-6">
        <div v-for="(feature, idx) in features" :key="idx" class="pt-6">
          <div class="flow-root rounded-lg px-6 pb-8 h-full bg-gray-50 dark:bg-gray-700 transition-colors">
            <span class="inline-flex items-center justify-center p-3 bg-amber-500 rounded-md shadow-lg">
              <component :is="feature.icon" class="h-6 w-6 text-white" />
            </span>
            <h3 class="mt-8 text-lg font-medium text-gray-900 dark:text-white">{{ feature.name }}</h3>
            <p class="mt-5 text-base text-gray-500 dark:text-gray-300">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
