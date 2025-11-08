<script setup>
import { ref } from "vue"
import axios from "axios"

const file = ref(null)
const preview = ref(null)
const response = ref(null)
const loading = ref(false)
const error = ref(null)

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    file.value = selectedFile
    error.value = null

    // Generate preview URL
    preview.value = URL.createObjectURL(selectedFile)

    console.log("Selected file:", selectedFile.name)
  } else {
    file.value = null
    preview.value = null
    error.value = "No file selected"
  }
}

const uploadFile = async () => {
  if (!file.value) {
    error.value = "Please select a file"
    return
  }

  loading.value = true
  error.value = null
  response.value = null

  try {
    const formData = new FormData()
    formData.append("file", file.value) // must match FastAPI parameter name

    console.log("Uploading:", file.value.name)

    const res = await axios.post("http://127.0.0.1:8000/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    response.value = res.data
    console.log("response::", res)
  } catch (err) {
    error.value = err.response?.data?.detail || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto space-y-4">
    <h1 class="text-xl font-bold">Road & Pothole Detection</h1>

    <input
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="border p-2 rounded w-full"
    />

    <!-- Image Preview -->
    <div v-if="preview" class="mt-4">
      <p class="text-sm text-gray-600">Preview:</p>
      <img :src="preview" alt="Selected" class="mt-2 w-full rounded shadow" />
    </div>

    <button
      @click="uploadFile"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
      :disabled="loading"
    >
      {{ loading ? "Uploading..." : "Analyze" }}
    </button>

    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>

    <pre
      v-if="response"
      class="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap mt-4"
    >
      {{ response }}
    </pre>
  </div>
</template>
