<template>
  <div class="p-4">
    <n-card title="📷 Upload Road Images">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleChange"
            class="hidden"
            id="imageUpload"
          />
          <n-button @click="() => fileInput && fileInput.click()" size="small" circle>
            <fa-cloud-upload-alt />
          </n-button>

          <label for="imageUpload" class="cursor-pointer font-medium">Select images (JPG/PNG)</label>

          <div class="ml-auto text-right">
            <div v-if="location" class="text-sm text-green-700">
              <fa-map-marker-alt class="inline mr-1" />
              Location locked: Lat {{ location.lat.toFixed(5) }}, Lng {{ location.lng.toFixed(5) }}
            </div>
            <div v-if="locationError" class="text-sm text-red-600">
              {{ locationError }}
            </div>
          </div>
        </div>

        <n-separator />

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="(img, i) in previews"
            :key="i"
            class="relative border rounded-md p-2 bg-white dark:bg-gray-800"
          >
            <img
              :src="img.src"
              :alt="`preview-${i}`"
              class="w-full h-36 object-cover rounded"
              :class="{ 'filter grayscale opacity-60': !img.allowed }"
            />

            <div class="mt-2 text-sm flex items-center justify-between">
              <div>
                <div>Progress: {{ uploadStatus[i]?.progress ?? 0 }}%</div>
                <div :class="statusClass(uploadStatus[i]?.status)">
                  {{ uploadStatus[i]?.status ?? 'pending' }}
                </div>
              </div>

              <div v-if="!img.allowed" class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                Not allowed
              </div>
            </div>

            <n-progress
              :value="uploadStatus[i]?.progress ?? 0"
              :show-value="false"
              size="small"
              class="mt-2"
            />
          </div>
        </div>

        <div v-if="rejectedImages.length" class="mt-3">
          <n-card size="small" title="🚫 Some images were rejected" bordered>
            <ul class="list-disc ml-4 text-sm text-red-600">
              <li v-for="(r, idx) in rejectedImages" :key="idx">{{ r }}</li>
            </ul>
          </n-card>
        </div>

        <div class="flex gap-2 justify-end">
          <n-button type="default" @click="clearAll" size="small">Clear</n-button>
          <n-button type="primary" :disabled="isUploading || !hasPendingUploads" @click="retryFailed" size="small">
            Retry Failed
          </n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import * as exifr from 'exifr';
import { NCard, NButton, NSeparator, NProgress } from 'naive-ui';

// icons
import {
  FaCloudUploadAlt,
  FaMapMarkerAlt,
} from 'vicons/fa';

// --- Reactive state ---
const fileInput = ref<HTMLInputElement | null>(null);
type Preview = { src: string; allowed: boolean; file?: File };
const previews = ref<Preview[]>([]);
const uploadStatus = ref<Array<{ progress: number; status: 'pending' | 'success' | 'fail' | 'uploading' }>>([]);
const location = ref<{ lat: number; lng: number } | null>(null);
const locationError = ref<string | null>(null);
const rejectedImages = ref<string[]>([]);
const isUploading = ref(false);

// Upload endpoint (kept same as original)
const UPLOAD_URL = 'https://pothole-spotter.onrender.com/upload';

// helper: distance in meters (Haversine)
function getDistanceMeters(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// clear object URLs on unmount
onUnmounted(() => {
  previews.value.forEach((p) => {
    try { URL.revokeObjectURL((p as any).src); } catch {}
  });
});

// UI helpers
const statusClass = (s?: string) => {
  if (s === 'success') return 'text-green-600 font-semibold';
  if (s === 'fail') return 'text-red-600 font-semibold';
  return 'text-yellow-600 font-semibold';
};

const hasPendingUploads = computed(() => {
  return uploadStatus.value.some((u) => u.status === 'pending' || u.status === 'fail' || u.status === 'uploading');
});

// --- File selection handler ---
async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target?.files?.length) return;

  // reset
  previews.value = [];
  uploadStatus.value = [];
  rejectedImages.value = [];
  locationError.value = null;

  const files = Array.from(target.files);

  // get device geolocation first (promise)
  try {
    const deviceLoc = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported.'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(new Error('Failed to get location: ' + err.message)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    location.value = deviceLoc;
    locationError.value = null;

    const allowedFiles: File[] = [];
    const previewData: Preview[] = [];
    const statusArr: Array<{ progress: number; status: 'pending' | 'success' | 'fail' | 'uploading' }> = [];
    const rejected: string[] = [];

    // iterate files and validate EXIF GPS if present
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      let gps: any = null;

      try {
        // exifr.gps returns an object with latitude and longitude if present
        gps = await exifr.gps(file).catch(() => null);
      } catch (err) {
        // if EXIF read fails, continue allowing the file (per original behaviour)
        gps = null;
      }

      if (!gps || !deviceLoc) {
        // allow if there's no EXIF gps or if deviceLoc missing (per original)
        allowedFiles.push(file);
        previewData.push({ src: previewUrl, allowed: true, file });
        statusArr.push({ progress: 0, status: 'pending' });
      } else {
        // compute distance
        const dist = getDistanceMeters(deviceLoc, { lat: gps.latitude, lng: gps.longitude });
        if (dist <= 50) {
          allowedFiles.push(file);
          previewData.push({ src: previewUrl, allowed: true, file });
          statusArr.push({ progress: 0, status: 'pending' });
        } else {
          // reject and add message
          previewData.push({ src: previewUrl, allowed: false, file });
          rejected.push(`❌ Image ${i + 1} is too far (${Math.round(dist)}m) from your location.`);
        }
      }
    }

    previews.value = previewData;
    uploadStatus.value = statusArr;
    rejectedImages.value = rejected;

    if (allowedFiles.length > 0) {
      // start uploading allowed files
      uploadImages(allowedFiles, deviceLoc);
    }
  } catch (err: any) {
    location.value = null;
    locationError.value = err?.message ?? String(err);
  } finally {
    // reset the input so same files can be chosen again if needed
    if (fileInput.value) fileInput.value.value = '';
  }
}

// --- Upload logic (XMLHttpRequest with progress) ---
function uploadImages(files: File[], deviceLoc: { lat: number; lng: number } | null) {
  isUploading.value = true;
  files.forEach((file, index) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('image', file);
    if (deviceLoc) {
      formData.append('lat', String(deviceLoc.lat));
      formData.append('lng', String(deviceLoc.lng));
    }

    // find the correct preview index for this file (previews may include rejected items)
    const previewIndex = previews.value.findIndex((p) => (p.file === file) || (p.src && p.src.includes((file as any).name)));

    uploadStatus.value[previewIndex] = { progress: 0, status: 'uploading' };

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        uploadStatus.value[previewIndex] = { ...uploadStatus.value[previewIndex], progress: percent, status: 'uploading' };
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const ok = xhr.status >= 200 && xhr.status < 300;
        uploadStatus.value[previewIndex] = { ...uploadStatus.value[previewIndex], progress: 100, status: ok ? 'success' : 'fail' };
        // when all uploads complete, switch isUploading off
        const stillUploading = uploadStatus.value.some((u) => u.status === 'uploading' || u.status === 'pending');
        if (!stillUploading) isUploading.value = false;
      }
    };

    xhr.open('POST', UPLOAD_URL, true);
    xhr.send(formData);
  });

  // If no files (edge), stop uploading state
  if (!files.length) isUploading.value = false;
}

// retry failed uploads
function retryFailed() {
  const failedIndices = uploadStatus.value
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => s.status === 'fail')
    .map((x) => x.idx);

  if (!failedIndices.length) return;

  const filesToRetry: File[] = [];
  failedIndices.forEach((idx) => {
    const p = previews.value[idx];
    if (p?.file) filesToRetry.push(p.file);
    // reset status to pending so progress UI shows
    uploadStatus.value[idx] = { progress: 0, status: 'pending' };
  });

  if (filesToRetry.length) {
    uploadImages(filesToRetry, location.value);
  }
}

// clear everything
function clearAll() {
  previews.value.forEach((p) => {
    try { URL.revokeObjectURL((p as any).src); } catch {}
  });
  previews.value = [];
  uploadStatus.value = [];
  rejectedImages.value = [];
  location.value = null;
  locationError.value = null;
  isUploading.value = false;
}
</script>

<style scoped>
/* small utility styles */
.preview-image {
  border-radius: 6px;
}

/* dark-friendly card background fallback */
:root {
  --card-bg: #ffffff;
}
</style>
