<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white flex items-center justify-center py-16 p-4 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <component :is="FaRoad" class="absolute top-[20%] left-[5%] opacity-10 text-amber-500 text-3xl animate-float-1" />
      <component :is="FaCar" class="absolute top-[60%] left-[80%] opacity-10 text-amber-500 text-3xl animate-float-2" />
      <component :is="FaTrafficLight"
        class="absolute top-[30%] left-[85%] opacity-10 text-amber-500 text-3xl animate-float-3" />
      <component :is="FaMapMarkedAlt"
        class="absolute top-[80%] left-[10%] opacity-10 text-amber-500 text-3xl animate-float-4" />
    </div>

    <div class="absolute w-48 h-48 bottom-[-50px] right-[-50px] opacity-5">
      <div class="absolute w-36 h-36 rounded-full bg-gray-800 animate-pothole-pulse"></div>
      <div class="absolute w-32 h-32 rounded-full bg-amber-500 top-1 left-1 animate-pothole-fill"></div>
    </div>

    <div class="absolute inset-0 pointer-events-none">
      <div v-for="n in 20" :key="n"
        class="absolute w-1 h-1 bg-amber-500 bg-opacity-50 rounded-full animate-particle-float"
        :style="particleStyle(n)" />
    </div>

    <div
      class="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-transform duration-300 hover:-translate-y-1">
      <!-- Left: Form -->
      <div class="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-black/80 to-gray-900/80">
        <h2 class="text-3xl font-bold text-amber-500 mb-2">Create Account</h2>
        <p class="text-gray-300 mb-6">Join our road monitoring community</p>

        <div v-if="error" class="mb-4 rounded-md px-4 py-3 bg-red-600 text-white">{{ error }}</div>

        <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <n-form-item label="First Name" path="firstName">
              <n-input v-model:value="formValue.firstName" placeholder="John" />
            </n-form-item>

            <n-form-item label="Last Name" path="lastName">
              <n-input v-model:value="formValue.lastName" placeholder="Doe" />
            </n-form-item>
          </div>

          <n-form-item label="Email Address" path="email">
            <n-input v-model:value="formValue.email" type="text" placeholder="you@example.com" />
          </n-form-item>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <n-form-item label="Phone Number" path="phone">
              <n-input v-model:value="formValue.phone"  type="text" placeholder="+1234567890" />
            </n-form-item>

            <n-form-item label="Country" path="country">
              <n-select v-model:value="formValue.country" :options="countryOptions" placeholder="Select country"
                filterable />
            </n-form-item>
          </div>

          <n-form-item label="Password" path="password">
            <n-input v-model:value="formValue.password" type="password" placeholder="••••••••" show-password />
          </n-form-item>

          <n-form-item label="Confirm Password" path="confirmPassword">
            <n-input v-model:value="formValue.confirmPassword" type="password" placeholder="••••••••" show-password />
          </n-form-item>

          <n-alert title="" type="info">
            <div class="mt-4 text-sm text-gray-300">
              By signing up, you agree to our
              <a href="/terms" class="text-amber-500 hover:underline">Terms and Conditions</a>.
            </div>
          </n-alert>


          <n-button :loading="isLoading" type="primary" block @click="handleSubmit">Create Account</n-button>

          <div class="relative my-6">
            <div class="absolute inset-x-0 top-1/2 h-px bg-gray-700/30"></div>
            <div class="relative inline-flex justify-center px-2 bg-white dark:bg-gray-800 text-sm text-gray-400">
              Or sign up with
            </div>
          </div>

          <n-button type="default" block class="flex flex-row items-center justify-center gap-10 text-white"
            @click="signUpWithGoogle">
            <n-image width="40" :src="google_logo" /> <span>Sign up with
              Google</span>
          </n-button>

          <div class="mt-6 text-center text-sm text-gray-400">
            Already have an account?
            <RouterLink to="/auth/login" class="font-medium text-amber-500 hover:text-amber-400"> Sign in </RouterLink>
          </div>
        </n-form>
      </div>

      <!-- Right: Info -->
      <div
        class="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-amber-700 to-amber-900 text-gray-900 dark:text-gray-900 flex items-center">
        <div class="max-w-md mx-auto">
          <h1 class="text-4xl font-extrabold mb-4">Pothole Spotter</h1>
          <h2 class="text-2xl font-semibold mb-6">Smart Road Pothole Monitoring System</h2>

          <p class="mb-6">
            Create an account to contribute to safer roads. Report potholes, track repairs, and help improve your
            community's infrastructure.
          </p>

          <ul class="flex flex-col gap-3 mb-8">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Contribute to safer roads in your community</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Track reported issues and repairs</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
              <span>Earn rewards for active participation</span>
            </li>
          </ul>

          <div class="bg-black/10 p-4 rounded-lg">
            <p class="text-sm italic mb-2">
              "Since implementing this system, our city has seen a 40% reduction in road-related complaints and a
              significant improvement in road quality."
            </p>
            <p class="text-sm font-medium">© Pothole Spotter {{ year }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'
import { NForm, NFormItem, NInput, NButton, NSelect, FormInst, FormRules, useMessage } from 'naive-ui'
import {
  Road as FaRoad,
  Car as FaCar,
  TrafficLight as FaTrafficLight,
  MapMarkedAlt as FaMapMarkedAlt,
} from '@vicons/fa'
import { countries, END_POINTS, BACKEND_URL } from '@/utils/index.js'
import { useUserStore } from '../store/userStore'
import google_logo from "../assets/google-logo.png"

const userStore = useUserStore()

const router = useRouter()
const year = new Date().getFullYear()
const messageApi = useMessage()

const formRef = ref<FormInst | null>(null)
const formValue = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  country: null as string | null,
  acceptTerms: true
})

const rules: FormRules = {
  firstName: [{ required: true, message: 'First name is required', trigger: 'blur' }],
  lastName: [{ required: true, message: 'Last name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      validator(rule, value) {
        return value === formValue.value.password
      },
      message: 'Passwords do not match',
      trigger: 'blur'
    }
  ],
  phone: [{ required: true, message: 'Phone number is required', trigger: 'blur' }],
  country: [{ required: true, message: 'Country is required', trigger: 'change' }],
  acceptTerms: [
    {
      validator(rule, value) {
        return value === true
      },
      message: 'You must accept the terms',
      trigger: 'change'
    }
  ]
}

const countryOptions = countries.map((c: any) => ({ label: c.name, value: c.code }))

const isLoading = ref(false)
const error = ref('')
const response_message = ref("")
async function handleSubmit() {
  error.value = ''
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      isLoading.value = true
      try {
        const payload = { ...formValue.value }

        const res = await axios.post(END_POINTS.SIGNUP, payload, { timeout: 15000 })

        if (res?.data?.token) {
          userStore.setUser(res.data.user)
          userStore.setToken(res.data.token)
          response_message.value = 'Account created successfully'
          messageApi.success("Account created successfully for,", res.data.user.email)
          setTimeout(() => router.push('/'), 300)
        }
        else {
          response_message.value = 'An error occurred,Kindly try crating account later! or try loggin in!'
          messageApi.error('An error occurred,Kindly try again!')
        }
      } catch (err: any) {
        error.value = err?.message || 'Registration failed. Please try again.'
        messageApi.error('Registration failed. Please try again.')
      } finally {
        isLoading.value = false
      }
    }
  })
}
function signUpWithGoogle() {
  window.location.href = `${BACKEND_URL}/auth/google`
}

function particleStyle(n: number) {
  const left = Math.random() * 100
  const top = Math.random() * 100
  const delay = Math.random() * 5
  const scale = Math.random() * 0.5 + 0.5
  return { left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s`, transform: `scale(${scale})` }
}
</script>



<style scoped>
@keyframes animate-float-1 {
  from {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-8px)
  }

  to {
    transform: translateY(0)
  }
}

@keyframes animate-float-2 {
  from {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-10px)
  }

  to {
    transform: translateY(0)
  }
}

@keyframes animate-float-3 {
  from {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-6px)
  }

  to {
    transform: translateY(0)
  }
}

@keyframes animate-float-4 {
  from {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-12px)
  }

  to {
    transform: translateY(0)
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

@keyframes animate-pothole-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes animate-pothole-fill {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

.animate-pothole-pulse {
  animation: animate-pothole-pulse 2.5s ease-in-out infinite;
}

.animate-pothole-fill {
  animation: animate-pothole-fill 2.5s ease-in-out infinite;
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

.form-checkbox {
  accent-color: #f59e0b;
}
</style>
