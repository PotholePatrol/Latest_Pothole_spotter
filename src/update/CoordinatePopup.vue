<script setup lang="ts">
import { h } from "vue"
import { NIcon } from "naive-ui"
import { LocationOutline, CloseOutline } from "@vicons/ionicons5"

const props = defineProps({
  popup: { type: Object as () => { visible: boolean; content: string }, default: () => ({}) }
})
const emit = defineEmits(["close"])
</script>

<template>
  <div
    v-if="popup.visible"
    class="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1000] p-3 rounded-lg shadow-lg flex items-center bg-white dark:bg-gray-800 border dark:border-gray-700 border-2 rounded"
  >
    <div class="mr-3">
      <NIcon :component="LocationOutline" />
    </div>
    <div>
      <p class="text-sm font-medium">{{ popup.content }}</p>
    </div>
    <button
      class="ml-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      @click="emit('close')"
    >
      <NIcon :component="CloseOutline" />
    </button>
  </div>
</template>
