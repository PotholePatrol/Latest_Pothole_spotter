<template>
  <div border-b-black
    class="max-w-md mx-auto my-10 p-6 !border-1 border-green-500 rounded-2xl shadow-2xl backdrop-blur-xl">
    <n-space vertical>
      <n-input v-model:value="identifier" type="text" placeholder="Enter your email or phone number"
        :loading="isLoading" />
      <n-button v-if="!isIdentifierApproved" type="primary" @click="verifyIdentifier" :loading="isLoading"
        :disabled="!identifier">
        Continue
      </n-button>
    </n-space>

    <div v-if="isIdentifierApproved" class="mt-6">
      <NGradientText type="success">Enter otp sent to your email</NGradientText>
      <n-input-otp v-model:value="otp" @finish="onFinish" @update:value="onUpdateValue" />
    </div>

    <!-- Password Reset Step -->
    <div v-if="showInputs" class="mt-6">
      <n-space vertical>
        <n-input v-model:value="password" type="password" placeholder="Enter new password" />
        <n-input v-model:value="confirmPassword" type="password" :status="confirmPasswordStatus"
          placeholder="Confirm new password" />
      </n-space>
      <n-button class="mt-4" type="success" @click="savePassword">Save</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import axios from 'axios'
import { END_POINTS } from '../utils/index.js'

const messageApi = useMessage()

// State
const identifier = ref('')
const otp = ref('')
const isLoading = ref(false)
const isIdentifierApproved = ref(false)
const showInputs = ref(false)
const password = ref('')
const confirmPassword = ref('')

// Computed validation
const confirmPasswordStatus = computed(() => {
  if (!confirmPassword.value) return undefined
  return confirmPassword.value === password.value ? 'success' : 'error'
})

// API: Verify identifier (email/phone)
const verifyIdentifier = async () => {
  try {
    isLoading.value = true
    const { data } = await axios.post(END_POINTS.VERIFY_IDENTIFIER, {
      identifier: identifier.value
    })
    console.log(data)
    isIdentifierApproved.value = data.exists
    if (!data.exists) {
      messageApi.error(data.message || 'user not found')
    } else {
      messageApi.success(data.message || 'Identifier verified')
    }
  } catch (error) {
    messageApi.error('Failed to verify user,check your credentials and try again!')
  } finally {
    isLoading.value = false
  }
}

// API: Verify OTP
const onFinish = async () => {
  try {
    messageApi.loading('Verifying OTP...')
    const { data } = await axios.post(END_POINTS.VERIFY_OTP, {
      otp: otp.value
    })
    if (data.approved) {
      showInputs.value = true
      isIdentifierApproved.value = false
      messageApi.success('OTP verified')
    } else {
      messageApi.error(data.message || 'Invalid OTP')
    }
  } catch (error) {
    messageApi.error('Failed to verify OTP')
  } finally {
    isLoading.value = false
  }
}

const onUpdateValue = (val: string) => {
  otp.value = val
}

// API: Save new password
const savePassword = async () => {
  if (confirmPasswordStatus.value !== 'success') {
    messageApi.error('Passwords do not match')
    return
  }
  try {
    isLoading.value = true
    const { data } = await axios.post(END_POINTS.SAVE_PASSWORD, {
      identifier: identifier.value,
      password: password.value
    })
    if (data.success) {
      messageApi.success('Password updated successfully')
      showInputs.value = false
    } else {
      messageApi.error(data.message || 'Failed to save password')
    }
  } catch (error) {
    messageApi.error('Error while saving password')
  } finally {
    isLoading.value = false
  }
}
</script>
