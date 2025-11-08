<template>
  <div
    class="p-6 md:p-10 mx-auto min-h-screen max-w-6xl transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

    <header class="mb-8 text-center">
      <h1 class="text-3xl md:text-4xl font-extrabold text-black dark:text-white">Contact Us</h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Send feedback or questions — public posts are shown on the right.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <section>
        <n-card class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-6">
          <div class="flex flex-col gap-6">
            <h2 class="text-2xl font-semibold text-black dark:text-white">Send us a message</h2>

            <transition name="fade">
              <div v-if="error" class="rounded-md p-3 bg-red-600 text-white text-sm">{{ error }}</div>
            </transition>
            <transition name="fade">
              <div v-if="success" class="rounded-md p-3 bg-green-600 text-white text-sm">{{ success }}</div>
            </transition>

            <form @submit.prevent="sendMessage" class="grid gap-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="relative block">
                  <div class="absolute left-3 top-[30%] pointer-events-none">
                    <n-icon :component="FaUser" class="icon" />
                  </div>
                  <input v-model="name" type="text" placeholder="Your name (optional)"
                    class="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
                </label>

                <label class="relative block">
                  <div class="absolute left-3 top-[30%] pointer-events-none">
                    <n-icon :component="FaEnvelope" class="icon" />
                  </div>
                  <input v-model="email" type="email" placeholder="your@email.com"
                    class="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
                </label>
              </div>

              <textarea v-model="message" rows="5" placeholder="Type your message here..."
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y focus:ring-2 focus:ring-blue-500 outline-none"></textarea>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="isPublic"
                    class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300" />
                  <span class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <n-icon :component="FaGlobe" class="icon-xs" /> Public
                  </span>
                </label>

                <n-button @click="sendMessage" :loading="loading" :disabled="loading"
                  class="ml-auto px-5 py-2 rounded-lg shadow-md flex items-center gap-2" type="primary" html-type="submit">
                  <n-icon :component="FaPaperPlane" class="icon-sm" />
                  {{ isPublic ? 'Post Publicly' : 'Send Privately' }}
                </n-button>
              </div>
            </form>
          </div>
        </n-card>
      </section>

      <aside>
        <n-divider class="mb-4">
          <span class="text-lg font-medium px-3 text-black dark:text-white">
            Public Messages ({{ messages.length }})
          </span>
        </n-divider>

        <div class="grid gap-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
          <n-card v-if="messages.length === 0"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl">
            <p class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
              No public messages yet. Be the first to post!
            </p>
          </n-card>

          <template v-for="msg in messages" :key="msg.id">
            <n-card
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl hover:shadow-lg transition">
              <article class="flex gap-4">
                <div class="flex-shrink-0">
                  <n-avatar v-if="msg.profile_pic" :src="msg.profile_pic" size="large" />
                  <n-avatar v-else-if="msg.name" :text="msg.username.charAt(0)" size="large"
                    class="bg-blue-500 text-white font-bold" />
                  <div v-else class="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500 text-white">
                    <n-icon :component="FaUser" class="icon" />
                  </div>
                </div>

                <div class="flex-1">
                  <header class="flex flex-wrap items-center gap-2 mb-2">
                    <h3 class="font-semibold text-black dark:text-white">{{ msg.username || 'Anonymous' }}</h3>
                    <time class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(msg.created_at) }}</time>
                    <span v-if="msg.reply"
                      class="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Admin
                      Replied</span>
                  </header>

                  <p class="mb-3 text-gray-800 dark:text-gray-200 leading-relaxed">
                    {{ msg.message || msg.content }}
                  </p>

                  <div v-if="msg.reply" class="pl-4 border-l-4 mb-3 border-blue-500 dark:border-blue-600">
                    <div class="flex items-center gap-2 text-sm mb-1">
                      <n-icon :component="FaReply" class="icon-xs bg-blue-100 rounded-full p-0.5" />
                      <span class="font-semibold text-black dark:text-white">Admin</span>
                      <time class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(msg.reply_date) }}</time>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ msg.reply }}</p>
                  </div>

                  <div class="flex gap-3 items-center text-sm">
                    <button @click="handleVote(msg.id, true)" :aria-pressed="msg.userVote === 'like'" class="icon-btn">
                      <n-icon :component="FaThumbsUp" class="icon-sm" />
                      <span class="ml-1">{{ displayNumber(msg.likes.length) }}</span>
                    </button>
                    <button @click="handleVote(msg.id, false)" :aria-pressed="msg.userVote === 'dislike'" class="icon-btn">
                      <n-icon :component="FaThumbsDown" class="icon-sm" />
                      <span class="ml-1">{{ displayNumber(msg.dislikes.length) }}</span>
                    </button>
                  </div>
                </div>
              </article>
            </n-card>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { NButton, NCard, NDivider, NAvatar, NIcon } from 'naive-ui'
import { API_BASE_URL } from '@/utils/index.js'
import { useUserStore } from '../store/userStore'

import {
  User as FaUser,
  Envelope as FaEnvelope,
  PaperPlane as FaPaperPlane,
  Globe as FaGlobe,
  ThumbsUp as FaThumbsUp,
  ThumbsDown as FaThumbsDown,
  Reply as FaReply
} from '@vicons/fa'

const message = ref('')
const isPublic = ref(true)
const userStore = useUserStore()
const messages = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const name = ref('')
const email = ref('')

watch(
  () => userStore.user, 
  (user) => {
    if (user?.email) {
      name.value = user.firstName || ''
      email.value = user.email || ''
    }
  },
  { immediate: true }
)

async function fetchPublicMessages() {
  try {
    const res = await fetch(`${API_BASE_URL}/contact_us_messages`)
    const data = await res.json()
    messages.value = data.messages ?? data ?? []
  } catch (err) {
    console.error(err)
  }
}

async function sendMessage() {
  if (!message.value.trim()) {
    error.value = 'Please enter a message'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const res = await fetch(`${API_BASE_URL}/contact_us_messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message.value,
        name: name.value.trim() || 'Anonymous',
        email: email.value,
        isPublic: isPublic.value
      })
    })
    const result = await res.json()
    const newMessage = result.messageData ?? result
    if (isPublic.value) messages.value = [newMessage, ...messages.value]
    message.value = ''
    success.value = isPublic.value ? 'Message posted publicly!' : 'Private message sent!'
  } catch (err) {
    error.value = 'Failed to send message'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleVote(id: string | number, isLike: boolean) {
  try {
    if (!userStore.user?.id) return;

    const res = await fetch(`${API_BASE_URL}/messages/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isLike,
        userId: userStore.user.id,
        commentId:id
      }),
    });

    if (!res.ok) {
      console.error("Failed to submit vote", await res.text());
      return;
    }

    // Update UI state optimistically
    messages.value = messages.value.map((m: any) => {
      if (m.id !== id) return m;

      // Ensure likes/dislikes are arrays
      const likes = Array.isArray(m.likes) ? [...m.likes] : [];
      const dislikes = Array.isArray(m.dislikes) ? [...m.dislikes] : [];

      // Remove user from both arrays first
      const newLikes = likes.filter((uid: string) => uid !== userStore.user?.id);
      const newDislikes = dislikes.filter(
        (uid: string) => uid !== userStore.user?.id
      );

      // Add user to the correct one
      if (isLike) {
        newLikes.push(userStore.user.id);
      } else {
        newDislikes.push(userStore.user.id);
      }

      return {
        ...m,
        likes: newLikes,
        dislikes: newDislikes,
        userVote: isLike ? "like" : "dislike",
      };
    });
  } catch (err) {
    console.error("Vote error:", err);
  }
}


function formatDate(s?: string) {
  if (!s) return ''
  return new Date(s).toLocaleString()
}

function displayNumber(v: any) {
  return v == null ? 0 : v
}

onMounted(() => {
  fetchPublicMessages()
})
</script>

<style scoped>
.icon { width: 1.125rem; height: 1.125rem; }
.icon-xs { width: 0.875rem; height: 0.875rem; }
.icon-sm { width: 1rem; height: 1rem; }
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
}
.icon-btn:focus {
  outline: 2px solid rgba(59, 130, 246, 0.25);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.06);
}
.form-checkbox { accent-color: #3b82f6; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
