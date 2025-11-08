<template>
  <footer class="relative bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 pt-16 pb-8 px-4 overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 rounded-full filter blur-3xl opacity-20 pulse-delay"></div>
    </div>

    <!-- Road divider -->
    <div class="relative h-1 mb-12 mx-auto max-w-4xl">
      <div class="absolute inset-0 bg-amber-500"></div>
      <div class="absolute inset-0 bg-black/20 flex">
        <div v-for="i in 20" :key="i" class="h-full w-8 bg-black mx-2"></div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center">
            <component :is="FaRoad" class="text-amber-500 text-3xl mr-3" />
            <h2 class="text-2xl font-bold text-black dark:text-white">Pothole Spotter</h2>
          </div>
          <p class="text-gray-600 dark:text-gray-400">Smart Infrastructure Monitoring System</p>
          <p class="text-gray-500 text-sm">© {{ year }} SmartRoads Project – All rights reserved</p>
        </div>

        <!-- Quick links -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-black dark:text-white">Quick Links</h3>
          <div class="grid grid-cols-2 gap-4">
            <a href="#about" class="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors duration-300 group">
              About
              <span class="block h-0.5 bg-amber-500 w-0 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#contact" class="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors duration-300 group">
              Contact
              <span class="block h-0.5 bg-amber-500 w-0 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#privacy" class="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors duration-300 group">
              Privacy
              <span class="block h-0.5 bg-amber-500 w-0 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#terms" class="text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors duration-300 group">
              Terms
              <span class="block h-0.5 bg-amber-500 w-0 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
        </div>

        <!-- Social -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-black dark:text-white">Connect With Us</h3>
          <div class="flex space-x-4">
            <a
              href="https://x.com/Vi_brant_"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="Twitter"
            >
              <component :is="FaTwitter" class="text-xl group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="https://github.com/PotholePatrol"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="GitHub"
            >
              <component :is="FaGithub" class="text-xl group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="https://www.linkedin.com/in/steven-muiruri-11b73a263/"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <component :is="FaLinkedin" class="text-xl group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <!-- Credits -->
      <div class="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
        <div class="flex items-center space-x-2 mb-4 md:mb-0">
          <span class="text-gray-500 dark:text-gray-400">Developed by</span>
          <span class="font-medium text-amber-500">CodeTarmac</span>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-gray-500 dark:text-gray-400">Powered by</span>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-blue-400 group">
              <component :is="FaMicrosoft" class="text-xl mr-1" />
              <span class="text-sm">Azure</span>
            </div>

            <div class="flex items-center text-cyan-400 group">
              <component :is="FaReact" class="text-xl mr-1 spin-slow" />
              <span class="text-sm">React</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating pothole -->
    <div class="absolute -bottom-20 -right-20 w-40 h-40 opacity-10 pointer-events-none">
      <div class="absolute w-32 h-32 rounded-full bg-gray-700 dark:bg-gray-700 animate-pulse"></div>
      <div class="absolute w-28 h-28 rounded-full bg-amber-500 top-2 left-2 pulse-delay"></div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Twitter as FaTwitter,
  Github as FaGithub,
  Linkedin as FaLinkedin,
  Road as FaRoad,
  React as FaReact,
  Microsoft as FaMicrosoft
} from '@vicons/fa'

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.spin-slow {
  animation: spin-slow 6s linear infinite;
}

@keyframes pulse-delay {
  0% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(1.03);
  }
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
}
.pulse-delay {
  animation: pulse-delay 2.5s ease-in-out infinite;
}
</style>
