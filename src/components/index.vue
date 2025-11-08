<script setup lang="ts">
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import Chaticon from './Chaticon.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
    <Navbar />
    <main class="flex-1 w-full ">
      <RouterView />
    </main>
    <Chaticon />
    <Footer />
  </div>
</template>
