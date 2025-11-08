<template>
  <div
    class="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <n-message-provider />

    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-amber-600">My Profile</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and report history</p>
        </div>

        <n-button size="small" type="error" @click="handleLogout" class="flex items-center gap-2">
          <n-icon>
            <LogOutOutline />
          </n-icon>
          Logout
        </n-button>
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Profile card -->
        <n-card :bordered="true"
          class="shadow-xl rounded-xl overflow-hidden w-full md:max-w-md bg-white dark:bg-gray-800">
          <div class="flex flex-col items-center p-6">
            <div class="relative mb-4">
              <n-avatar :size="120" :src="userData.profilePic || placeholder"
                class="border-2 border-amber-100 shadow-lg" />
              <div v-if="editMode" class="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1 rounded-full">
                <n-icon size="16">
                  <CloudUploadOutline />
                </n-icon>
              </div>
            </div>

            <div class="w-full text-center mb-6">
              <h2 class="text-xl font-semibold">{{ userData.firstName }} {{ userData.lastName }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ userData.email }}</p>
              <p v-if="userData.country" class="text-xs text-amber-500 mt-1">{{ userData.country.name }}</p>
            </div>

            <div class="flex items-center gap-3 mb-6 w-full justify-center">
              <n-button size="small" @click="enterEditMode" v-if="!editMode" :disabled="loading.userInfo"
                class="bg-amber-500 hover:bg-amber-600 border-0 text-white">
                Edit Profile
              </n-button>

              <n-button size="small" type="primary" @click="saveProfile" :disabled="loading.saving" v-if="editMode"
                class="bg-green-500 hover:bg-green-600 border-0">
                <template #icon>
                  <n-icon v-if="!loading.saving">
                    <CloudUploadOutline />
                  </n-icon>
                </template>
                {{ loading.saving ? 'Saving...' : 'Save Changes' }}
              </n-button>

              <n-button size="small" ghost @click="cancelEdit" v-if="editMode"
                class="text-gray-500 hover:text-gray-700">
                Cancel
              </n-button>
            </div>

            <div class="w-full">
              <div v-if="editMode" class="space-y-4">
                <n-space vertical class="w-full">
                  <div class="grid grid-cols-2 gap-3">
                    <n-input v-model:value="userData.firstName" placeholder="First name" />
                    <n-input v-model:value="userData.lastName" placeholder="Last name" />
                  </div>

                  <n-input v-model:value="userData.email" placeholder="Email" disabled />
                  <n-input v-model:value="userData.phoneNo" placeholder="Phone number" />

                  <n-select v-model:value="userData.country" :options="countryOptions" label-field="name"
                    value-field="code" placeholder="Select your country" filterable />

                  <div class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <p class="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Profile Picture</p>
                    <div class="flex items-center gap-4">
                      <input ref="fileInput" hidden type="file" accept="image/*" @change="onFileChange" />

                      <n-button size="large" quaternary circle @click="fileInput?.click()" :disabled="uploading"
                        class="bg-amber-100 text-amber-600 hover:bg-amber-200">
                        <n-icon size="24">
                          <imageUploadIcon />
                        </n-icon>
                      </n-button>

                      <div class="flex-1">
                        <p class="text-xs text-gray-500 mb-1">Select a new profile image</p>
                        <p class="text-xs text-gray-400" v-if="selectedFile">{{ selectedFile.name }}</p>
                      </div>

                      <n-button size="small" type="primary" @click="uploadProfilePic"
                        :disabled="!selectedFile || uploading" class="bg-amber-500 hover:bg-amber-600 border-0">
                        <template #icon>
                          <n-icon>
                            <CloudUploadOutline />
                          </n-icon>
                        </template>
                        {{ uploading ? 'Uploading...' : 'Upload' }}
                      </n-button>
                    </div>

                    <div v-if="previewSrc" class="mt-4 flex justify-center">
                      <img :src="previewSrc" class="w-24 h-24 object-cover rounded-lg border shadow-md" />
                    </div>
                  </div>
                </n-space>
              </div>

              <div v-else class="space-y-4">
                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">First name</div>
                  <div class="font-medium text-lg">{{ userData.firstName || 'Not provided' }}</div>
                </div>

                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last name</div>
                  <div class="font-medium text-lg">{{ userData.lastName || 'Not provided' }}</div>
                </div>

                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                  <div class="font-medium text-lg">{{ userData.email || 'Not provided' }}</div>
                </div>

                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                  <div class="font-medium text-lg">{{ userData.phoneNo || 'Not provided' }}</div>
                </div>

                <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Country</div>
                  <div class="font-medium text-lg">{{ userData.country?.name || 'Not provided' }}</div>
                </div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- History list -->
        <n-card :bordered="true" class="shadow-xl rounded-xl overflow-hidden flex-1 bg-white dark:bg-gray-800">
          <div class="p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold">Report History</h3>
                <n-tag type="success" size="small" round>{{ historyData.length }}</n-tag>
              </div>

              <div class="flex items-center gap-2">
                <n-input v-model:value="search" placeholder="Search reports..." clearable @clear="applySearch"
                  @input="applySearch" class="min-w-[200px]" />
                <n-select :options="sortOptions" v-model:value="sortBy" size="small" @update:value="applySort"
                  class="min-w-[120px]" />
              </div>
            </div>

            <n-spin :show="loading.history">
              <div v-if="!historyData.length && !loading.history" class="py-16 text-center text-gray-500">
                <n-icon size="48" class="text-gray-300 mb-4">
                  <imageUploadIcon />
                </n-icon>
                <p class="text-lg font-medium">No reports yet</p>
                <p class="text-sm mt-1">Your submitted reports will appear here</p>
              </div>

              <n-list v-else class="space-y-4">
                <n-list-item v-for="item in paginatedHistory" :key="item.id"
                  class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <img :src="imageUrl(item.image_url)" @click="openGallery(itemImages(item))"
                      class="w-20 h-20 object-cover rounded-md cursor-pointer shadow-sm border hover:scale-105 transition-transform" />

                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div class="font-medium text-lg truncate">{{ item.label || 'Untitled Report' }}</div>
                          <div class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</div>
                        </div>

                        <div class="flex items-center gap-2 flex-shrink-0">
                          <router-link :to="{ path: '/home', query: { detection: item.id } }">
                            <n-button size="small" tertiary
                              class="text-amber-600 hover:text-amber-700">
                              View
                            </n-button>
                          </router-link>

                          <n-button size="small" quaternary @click="askDelete(item.id)"
                            class="text-red-500 hover:text-red-600">
                            Delete
                          </n-button>
                        </div>
                      </div>

                      <div
                        class="mt-2 text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded inline-block">
                        {{ coordsString(item.lat, item.lng) }}
                      </div>
                    </div>
                  </div>
                </n-list-item>
              </n-list>

              <div v-if="filteredHistory.length > 0"
                class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-sm text-gray-500">
                  Showing {{ pageStart }} - {{ pageEnd }} of {{ filteredHistory.length }} reports
                </div>

                <n-pagination v-model:page="page" :page-size="pageSize" :item-count="filteredHistory.length"
                  :page-count="Math.ceil(filteredHistory.length / pageSize)" show-quick-jumper />
              </div>
            </n-spin>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import {
  NCard,
  NAvatar,
  NInput,
  NSelect,
  NButton,
  NSpin,
  NList,
  NListItem,
  useMessage,
  NPagination,
  NTag,
  NSpace,
  NMessageProvider,
  NIcon
} from 'naive-ui'
import { LogOutOutline, Image as imageUploadIcon, CloudUploadOutline } from '@vicons/ionicons5'
import { BACKEND_URL, countries } from '@/utils/index'
import { useUserStore } from '../store/userStore'

interface Country { name: string; code: string }
interface HistoryItem {
  id: string;
  label: string;
  image_url: string;
  lat?: number;
  lng?: number;
  created_at?: string;
  images?: string[];
}

const fileInput = ref<HTMLInputElement | null>(null)
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = reactive({ userInfo: true, history: true, saving: false })
const uploading = ref(false)

const userData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNo: '',
  country: null as Country | null,
  profilePic: '' as string | null
})

const editMode = ref(false)
const selectedFile = ref<File | null>(null)
const previewSrc = ref<string | null>(null)

const historyData = ref<HistoryItem[]>([])
const search = ref('')
const sortBy = ref<string | null>('newest')
const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' }
]

const placeholder = ref('https://via.placeholder.com/150')
const galleryVisible = ref(false)
const galleryImages = ref<string[]>([])
const galleryIndex = ref(0)

const page = ref(1)
const pageSize = ref(6)
const userId = ref<string | null>(null)

const deleteDialog = ref(false)
const deleteTargetId = ref<string | null>(null)

const countryOptions = countries.map((c: any) => ({ name: c.name, code: c.code }))

function imageUrl(path?: string) {
  if (!path) return placeholder.value
  const fixed = path.replace(/\\/g, '/')
  return fixed.startsWith('http') ? fixed : `${BACKEND_URL}/${fixed}`
}

function itemImages(item: HistoryItem) {
  if (item.images && item.images.length) return item.images.map(imageUrl)
  return [imageUrl(item.image_url)]
}

function formatDate(d?: string) {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch { return d }
}

function coordsString(lat?: number, lng?: number) {
  if (lat == null || lng == null) return 'Coordinates not available'
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

const filteredHistory = computed(() => {
  let arr = historyData.value.slice()
  if (search.value) {
    const q = search.value.toLowerCase()
    arr = arr.filter(h =>
      (h.label || '').toLowerCase().includes(q) ||
      `${h.lat ?? ''},${h.lng ?? ''}`.includes(q)
    )
  }
  if (sortBy.value === 'newest') {
    arr = arr.sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )
  }
  if (sortBy.value === 'oldest') {
    arr = arr.sort((a, b) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    )
  }
  return arr
})

const paginatedHistory = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredHistory.value.slice(start, start + pageSize.value)
})

const pageStart = computed(() =>
  filteredHistory.value.length === 0 ? 0 : (page.value - 1) * pageSize.value + 1
)

const pageEnd = computed(() =>
  Math.min(page.value * pageSize.value, filteredHistory.value.length)
)

function setAuthHeader() {
  const t = localStorage.getItem('token')
  if (t) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }
  axios.defaults.timeout = 15000
}

async function fetchUserInfo(id: string) {
  loading.userInfo = true
  try {
    const res = await axios.get(`${BACKEND_URL}/api/user-details`, { params: { userId: id } })

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to fetch user information')
    }

    const info = res.data.user_info || {}

    // Preserve existing data to prevent clearing during updates
    const currentData = { ...userData }

    userData.firstName = info.first_name || currentData.firstName || ''
    userData.lastName = info.last_name || currentData.lastName || ''
    userData.email = info.email || currentData.email || ''
    userData.phoneNo = info.phone_number || currentData.phoneNo || ''

    // Find country or keep existing
    userData.country = countries.find((c: any) => c.code === info.country) || currentData.country

    userData.profilePic = info.profile_pic
      ? (info.profile_pic.startsWith('http')
        ? info.profile_pic
        : `${BACKEND_URL}/${info.profile_pic}`)
      : currentData.profilePic || ''

  } catch (err: any) {
    message.error(err.message || 'Failed to load user information')
    console.error('User info fetch error:', err)
  } finally {
    loading.userInfo = false
  }
}

async function fetchHistory(id: string) {
  loading.history = true
  try {
    const res = await axios.get(`${BACKEND_URL}/api/report-history`, { params: { userId: id } })
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to load history')
    historyData.value = res.data.history || []
  } catch (err: any) {
    message.error(err.message || 'Failed to load report history')
  } finally {
    loading.history = false
  }
}

onMounted(() => {
  setAuthHeader()
  const raw = localStorage.getItem('user')

  if (!raw) {
    message.error('Please log in to view your profile')
    router.push('/login')
    return
  }

  let parsed: any = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { id: raw }
  }

  if (!parsed?.id) {
    message.error('User ID not found')
    return
  }

  userId.value = parsed.id
  fetchUserInfo(parsed.id)
  fetchHistory(parsed.id)
})

function showMessage(type: 'success' | 'error' | 'warning', text: string) {
  if (type === 'success') message.success(text)
  if (type === 'error') message.error(text)
  if (type === 'warning') message.warning(text)
}

function enterEditMode() {
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
  selectedFile.value = null
  previewSrc.value = null

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // Reload original data
  if (userId.value) {
    fetchUserInfo(userId.value)
  }
}

async function saveProfile() {
  if (!userId.value) return

  loading.saving = true
  try {
    const payload = {
      userId: userId.value,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNo: userData.phoneNo,
      country: userData.country?.code
    }

    const res = await axios.put(`${BACKEND_URL}/api/user-details`, payload)

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to update profile')
    }

    showMessage('success', 'Profile updated successfully')
    editMode.value = false

    // Refresh user data to ensure consistency
    await fetchUserInfo(userId.value)

  } catch (err: any) {
    showMessage('error', err.message || 'Failed to update profile')
    console.error('Profile update error:', err)
  } finally {
    loading.saving = false
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] || null
  selectedFile.value = file

  // Clean up previous preview if it exists
  if (previewSrc.value) {
    URL.revokeObjectURL(previewSrc.value)
  }

  if (file) {
    previewSrc.value = URL.createObjectURL(file)
  }
}

async function uploadProfilePic() {
  if (!selectedFile.value || !userStore.user?.id) return

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append("profilePic", selectedFile.value)
    fd.append("userId", userStore.user.id)
    const res = await axios.post(`${BACKEND_URL}/api/upload-profile-pic`, fd, {
      headers: { "Content-Type": "multipart/form-data" }
    }
    )

    if (!res.data?.imagePath) {
      throw new Error(res.data?.error || "Upload failed")
    }

    userStore.setUser({
      ...userStore.user,
      profilePic: res.data.imagePath,
    })


    selectedFile.value = null
    previewSrc.value = null
    if (fileInput.value) fileInput.value.value = ""
    userData.profilePic = previewSrc.value
    if (previewSrc.value) {
      URL.revokeObjectURL(previewSrc.value)
    }
    message.success("Profile picture updated successfully ✅")
  } catch (err: any) {
    console.error("Profile picture upload error:", err)
    message.error(err.message || "Failed to upload picture ❌")
  } finally {
    uploading.value = false
  }
}

function openGallery(images: string[], start = 0) {
  galleryImages.value = images
  galleryIndex.value = start
  galleryVisible.value = true
}

function askDelete(id: string) {
  deleteTargetId.value = id
  deleteDialog.value = true
}

function applySearch() {
  page.value = 1
}

function applySort() {
  page.value = 1
}

function handleLogout() {
  userStore.clearUser()
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  showMessage('success', 'Logged out successfully')
  router.push('/')
}
</script>

<style scoped>
.n-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.n-list-item:last-child {
  border-bottom: none;
}

:deep(.n-card .n-card-header) {
  padding-bottom: 0.75rem;
}

:deep(.n-card .n-card-content) {
  padding-top: 0.75rem;
}
</style>