<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex items-center justify-center py-16 p-4 relative overflow-hidden">
    <!-- animated floating road elements -->
    <div class="absolute inset-0 pointer-events-none">
      <FaRoad class="absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" />
      <FaCar class="absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" />
      <FaTrafficLight class="absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" />
      <FaMapMarkedAlt class="absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" />
    </div>

    <!-- particles -->
    <div class="absolute inset-0 pointer-events-none">
      <div v-for="p in particles" :key="p.id"
        class="absolute w-1 h-1 bg-amber-500 bg-opacity-50 rounded-full animate-particle-float" :style="p.style" />
    </div>

    <div
      class="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-transform duration-300 hover:-translate-y-1">
      <!-- form section -->
      <div class="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-black/80 to-gray-900/80">
        <h2 class="text-3xl font-bold text-amber-500 mb-2">Welcome Back</h2>
        <p class="text-gray-300 mb-6">Sign in to access your dashboard</p>

        <div v-if="error" class="mb-4 rounded-md px-4 py-3 bg-red-600 text-white">{{ error }}</div>
        <div v-if="success" class="mb-4 rounded-md px-4 py-3 bg-green-600 text-white">{{ success }}</div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6" novalidate>
          <div class="flex items-center justify-between">
            <button type="button" @click="toggleLoginMethod"
              class="text-sm border border-gray-400 px-3 py-1 rounded-2xl text-amber-500 hover:bg-gray-700/40 transition-colors">
              {{ loginMethod === 'email' ? 'Use phone instead' : 'Use email instead' }}
            </button>
          </div>

          <div v-if="loginMethod === 'email'">
            <label class="text-sm font-medium text-gray-300">Email Address</label>
            <n-input v-model:value="email" placeholder="you@example.com" type="text"
              :status="formErrors.email ? 'error' : undefined" />
            <small v-if="formErrors.email" class="text-red-400">{{ formErrors.email }}</small>
          </div>

          <div v-else>
            <label class="text-sm font-medium text-gray-300">Phone Number</label>
            <n-input v-model:value="phone" type="text" inputmode="tel" placeholder="+1234567890" 
              :status="formErrors.phone ? 'error' : undefined" />
            <small v-if="formErrors.phone" class="text-red-400">{{ formErrors.phone }}</small>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-300">Password</label>
            <n-input v-model:value="password" type="password" placeholder="••••••••"
              :status="formErrors.password ? 'error' : undefined" show-password />
            <small v-if="formErrors.password" class="text-red-400">{{ formErrors.password }}</small>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <n-checkbox v-model:checked="rememberMe" />
              <label class="text-sm text-gray-300">Remember me</label>
            </div>
            <RouterLink to="/auth/reset-password" class="text-sm text-amber-500 hover:text-amber-400">Forgot password?
            </RouterLink>
          </div>

          <!-- NOTE: using a native button for submit to guarantee HTML form submission behavior -->
          <button type="submit" :disabled="isLoading"
            class="w-full rounded-md px-4 py-3 bg-amber-600 text-white font-semibold disabled:opacity-50">
            <span v-if="!isLoading">Sign In</span>
            <span v-else>Signing in…</span>
          </button>

          <div class="relative my-6">
            <div class="absolute inset-x-0 top-1/2 h-px bg-gray-700/30"></div>
            <div class="relative inline-flex justify-center px-2 bg-white dark:bg-gray-800 text-sm text-gray-400">Or
              continue with</div>
          </div>

          <n-button type="default" block @click="signInWithGoogle" class="flex items-center justify-center gap-2 text-white">
<n-image width="40" :src="google_logo" /> 
            <span>Sign in with Google</span>
          </n-button>

          <div class="mt-6 text-center text-sm text-gray-400">
            Don't have an account?
            <RouterLink to="/auth/signup" class="font-medium text-amber-500 hover:text-amber-400"> Sign up</RouterLink>
          </div>
        </form>
      </div>

      <!-- info section -->
      <div
        class="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-amber-700 to-amber-900 text-gray-900 dark:text-gray-900 flex items-center">
        <div class="max-w-md mx-auto">
          <h1 class="text-4xl font-extrabold mb-4">Pothole Spotter</h1>
          <h2 class="text-2xl font-semibold mb-6">Smart Road Pothole Monitoring System</h2>
          <p class="mb-6">Welcome! Log in to explore real-time road infrastructure and pothole monitoring—empowering
            cities to ensure safer streets and optimize maintenance costs.</p>

          <ul class="flex flex-col gap-3 mb-8">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Real-time pothole detection</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Automated reporting to city officials</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Data analytics dashboard</span>
            </li>
          </ul>

          <div class="bg-black/10 p-4 rounded-lg">
            <p class="text-sm italic mb-2">"This system has reduced our response time to road hazards by 75% and
              improved citizen satisfaction scores significantly."</p>
            <p class="text-sm font-medium">© Pothole Spotter {{ year }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { END_POINTS,BACKEND_URL } from '../utils/index.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import google_logo from "../assets/google-logo.png"

import { NButton, NInput, NCheckbox } from 'naive-ui'
import { Road as FaRoad, Car as FaCar, TrafficLight as FaTrafficLight, MapMarkedAlt as FaMapMarkedAlt } from '@vicons/fa'

const userStore = useUserStore()
const router = useRouter()
const year = new Date().getFullYear()

const loginMethod = ref<'email' | 'phone'>('email')
const email = ref('')
const phone = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const formErrors = reactive({
  email: '',
  phone: '',
  password: ''
})

const particles = ref<{ id: number; style: Record<string, string> }[]>([])

onMounted(() => {
  const arr = Array.from({ length: 20 }, (_, i) => {
    const left = Math.random() * 100
    const top = Math.random() * 100
    const delay = Math.random() * 5
    const scale = Math.random() * 0.5 + 0.5
    return {
      id: i,
      style: {
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale})`
      }
    }
  })
  particles.value = arr
})

function validateForm(): boolean {
  let valid = true
  formErrors.email = ''
  formErrors.phone = ''
  formErrors.password = ''

  if (loginMethod.value === 'email') {
    if (!email.value) {
      formErrors.email = 'Email is required'
      valid = false
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.value)
    ) {
      formErrors.email = 'Invalid email address'
      valid = false
    }
  } else {
    if (!phone.value) {
      formErrors.phone = 'Phone number is required'
      valid = false
    } else if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(
        phone.value
      )
    ) {
      formErrors.phone = 'Invalid phone number'
      valid = false
    }
  }

  if (!password.value) {
    formErrors.password = 'Password is required'
    valid = false
  } else if (password.value.length < 6) {
    formErrors.password = 'Password must be at least 6 characters'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (!validateForm()) {
    console.warn('Validation failed:', { ...formErrors })
    return
  }

  isLoading.value = true
  try {
    const payload =
      loginMethod.value === 'email'
        ? { identifier: email.value, password: password.value }
        : { identifier: phone.value, password: password.value }

    const res = await axios.post(END_POINTS.LOGIN, payload, { timeout: 15000 })

    if (res?.data?.token) {
      userStore.setUser(res.data.user)
      userStore.setToken(res.data.token)

     

      success.value = 'Login successful'
      setTimeout(() => router.push('/'), 300)
    } else {
      console.warn('[login] no token returned', res.data)
      success.value = 'Login succeeded (no token returned)'
      router.push('/')
    }
  } catch (err: any) {
    console.error('[login] error', err)
    if (err?.response) {
      error.value =
        err.response.data?.message || `Server error (${err.response.status})`
    } else if (err?.request) {
      error.value = 'No response from server. Check your internet connection!'
    } else {
      error.value = err.message || 'Login failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

function toggleLoginMethod() {
  loginMethod.value = loginMethod.value === 'email' ? 'phone' : 'email'
  error.value = ''
  formErrors.email = ''
  formErrors.phone = ''
  formErrors.password = ''
}

function signInWithGoogle() {
  window.location.href = `${BACKEND_URL}/auth/google`
}
</script>


<style scoped>
@keyframes animate-float-1 {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-8px)
  }
}

@keyframes animate-float-2 {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-10px)
  }
}

@keyframes animate-float-3 {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-6px)
  }
}

@keyframes animate-float-4 {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-12px)
  }
}

.animate-float-1 {
  animation: animate-float-1 6s ease-in-out infinite;
}

.animate-float-2 {
  animation: animate-float-2 5.5s ease-in-out infinite;
}

.animate-float-3 {
  animation: animate-float-3 6.5s ease-in-out infinite;
}

.animate-float-4 {
  animation: animate-float-4 7s ease-in-out infinite;
}

@keyframes particle-float {
  0% {
    opacity: 0.2;
    transform: translateY(0);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-6px);
  }

  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
}

.animate-particle-float {
  animation: particle-float 6s ease-in-out infinite;
}
</style>
