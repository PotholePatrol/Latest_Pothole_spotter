<template>
  <nav ref="navRef" :class="[
    'sticky top-0 w-full z-50 transition-all duration-300 mb-[50px] !z-[1000]',
    scrolled
      ? 'bg-gray-100/95 backdrop-blur-sm shadow-xl dark:bg-gray-900/95'
      : 'bg-white/80 backdrop-blur-sm shadow dark:bg-gray-900/80'
  ]">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-2 cursor-pointer" @click="goHome">
          <img :src="logoDark" alt="logo" class="h-12 w-auto" />
        </div>

        <div class="hidden md:flex items-center space-x-2">
          <template v-for="item in navItems" :key="item.name">
            <RouterLink v-if="item.path" :to="item.path"
              class="flex items-center px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all"
              :class="navLinkClass(item)">
              <n-icon :size="18" :component="item.icon" />
              <span class="ml-2">{{ item.name }}</span>
            </RouterLink>

            <div v-else class="relative">
              <button @click.stop="toggleDropdown(item.name)"
                class="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all  bg-amber-400/90"
                :class="dropdownBtnClass(item)">
                <n-icon :size="18" :component="item.icon" />
                <span class="ml-2">{{ item.name }}</span>
              </button>

              <transition name="fade-slide">
                <div v-if="activeDropdown === item.name"
                  class="absolute left-0 mt-2 w-56 rounded-md shadow-lg z-50 bg-white dark:bg-gray-800">
                  <RouterLink v-for="sub in item.subItems" :key="sub.path" :to="sub.path"
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    @click="closeDropdown">
                    {{ sub.name }}
                  </RouterLink>
                </div>
              </transition>
            </div>
          </template>

          <n-button size="small" circle ghost @click="toggleDark" aria-label="toggle theme">
            <n-icon :size="18" :component="isDark ? FaSun : FaMoon" />
          </n-button>
        </div>

        <div class="md:hidden flex items-center space-x-4">
          <n-button size="small" circle ghost @click="toggleDark" aria-label="toggle theme">
            <n-icon :size="18" :component="isDark ? FaSun : FaMoon" />
          </n-button>

          <n-button circle ghost @click="toggleMenu" aria-label="Open menu">
            <n-icon :size="18" :component="isOpen ? Close : Menu" />
          </n-button>
        </div>
      </div>
    </div>

    <transition name="expand">
      <div v-if="isOpen" class="md:hidden overflow-hidden bg-blue-800 dark:bg-gray-800">
        <div class="px-2 pt-2 pb-4 space-y-1">
          <template v-for="item in navItems" :key="item.name">
            <RouterLink v-if="item.path" :to="item.path"
              class="flex items-center px-3 py-3 rounded-md text-base font-medium max-h-[40px]"
              :class="mobileNavLinkClass(item)" @click="closeMobile">
              <component :is="item.icon" class="mr-3 h-8" />
              {{ item.name }}
            </RouterLink>

            <div v-else class="space-y-1">
              <button @click="toggleDropdown(item.name)"
                class="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-white dark:text-gray-300 bg-amber-400/90">
                <component :is="item.icon" class="mr-3 h-8" />
                <span class="ml-3">{{ item.name }}</span>
              </button>

              <div v-if="activeDropdown === item.name" class="pl-8 space-y-1">
                <RouterLink v-for="sub in item.subItems" :key="sub.path" :to="sub.path"
                  class="block px-3 py-2 rounded-md text-base font-medium"
                  :class="mobileNavLinkClass({ path: sub.path, name: sub.name })"
                  @click="() => { closeMobile(); activeDropdown = null }">
                  {{ sub.name }}
                </RouterLink>
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton } from 'naive-ui'
import { Menu, Close } from '@vicons/ionicons5'
import { Road as FaRoad, Sun as FaSun, Moon as FaMoon, Home as FaHome, InfoCircle as FaInfoCircle, SignInAlt as FaSignInAlt, UserPlus as FaUserPlus } from '@vicons/fa'
import logoDark from '@/assets/pothole-logo.png'
import { useUserStore } from '../store/userStore'

const userStore = useUserStore()
interface SubItem { path: string; name: string }
interface NavItem { path?: string; name: string; icon?: any; subItems?: SubItem[]; cta?: boolean }

const router = useRouter()
const route = useRoute()

const isOpen = ref(false)
const scrolled = ref(false)
const activeDropdown = ref<string | null>(null)
const navRef = ref<HTMLElement | null>(null)
const isDark = ref(userStore.theme === 'dark')

const navItems = computed<NavItem[]>(() => [
  { path: '/', name: 'Home', icon: FaHome },
  { path: '/about', name: 'About', icon: FaInfoCircle },
  {
    name: 'Services',
    icon: FaRoad,
    subItems: [
      { path: '/manual-train', name: 'update local pothole' },
      { path: '/?map=true', name: 'Full Map' },
      { path: '/contact', name: 'Feedback' }
    ]
  },
  userStore.user?.id
    ? { path: '/profile', name: userStore.user?.firstName || 'User', icon: FaUserPlus, cta: true }
    : { path: '/auth/login', name: 'Login', icon: FaSignInAlt, cta: true }
])

watch(() => route.fullPath, () => {
  isOpen.value = false
  activeDropdown.value = null
})

const handleScroll = () => { scrolled.value = window.scrollY > 10 }
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e: MouseEvent) {
  if (navRef.value && !navRef.value.contains(e.target as Node)) activeDropdown.value = null
}
function toggleMenu() { isOpen.value = !isOpen.value }
function toggleDropdown(name: string) { activeDropdown.value = activeDropdown.value === name ? null : name }
function closeDropdown() { activeDropdown.value = null }
function closeMobile() { isOpen.value = false; activeDropdown.value = null }
function goHome() { router.push('/') }
function toggleDark() {
  isDark.value = !isDark.value
  userStore.setTheme(isDark.value ? 'dark' : 'light')
}

function navLinkClass(item: NavItem) {
  const isActive = route.path === item.path
  return isActive
    ? 'bg-blue-700 text-white dark:bg-gray-700 dark:text-white'
    : 'text-gray-800 hover:bg-blue-800 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700'
}
function dropdownBtnClass(item: NavItem) {
  const isActive = activeDropdown.value === item.name
  return isActive
    ? 'bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-white'
    : 'text-gray-800 hover:bg-blue-800 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700'
}
function mobileNavLinkClass(item: NavItem) {
  const isActive = route.path === item.path
  return isActive
    ? 'bg-blue-700 text-white dark:bg-gray-700 dark:text-white'
    : 'text-gray-200 hover:bg-blue-700 dark:text-gray-300 dark:hover:bg-gray-700'
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.18s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from {
  height: 0;
  opacity: 0;
}

.expand-enter-to {
  height: auto;
  opacity: 1;
}

.expand-leave-from {
  height: auto;
  opacity: 1;
}

.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>
