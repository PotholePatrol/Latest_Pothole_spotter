import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
// import { i18n } from '../main'
// import { notificationsSocket, usersSocket } from '../web_socket'
import { refreshToken } from '../utils/index'

export const useUserStore = defineStore('userUseStore', () => {
  const theme = ref('dark')
  const lang = ref('en')
  const user = ref({
    id: null,
    email: null,
    firstName: null,
    lastName: null,
  })
  const token = ref(null)

  function setTheme(value) {
    theme.value = value
    document.documentElement.classList.toggle('dark', value === 'dark')
  }

  function setLang(value) {
    // lang.value = value || 'en'
    // i18n.global.locale.value = lang.value
  }

  function setUser(userData) {
    if (!userData) return
    user.value = userData
    localStorage.setItem('user', user.value.id)
  }

  function setToken(t) {
    token.value = t
  }

  function clearUser() {
    user.value = null
    setToken(null)
  }

  async function init() {
    const savedTheme = localStorage.getItem('theme')
    savedTheme ? setTheme(savedTheme) : setTheme('dark')

    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLang(savedLang)


    try {
      const userId = localStorage.getItem('user')
      const response = await refreshToken({ id: userId })
      if (response && response.token) {
        setUser(response.user)
        setToken(
          response.token,
        )

      }
    } catch (error) {
      console.error('Failed to refresh token during init:', error)
      clearUser()
    }
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
  })

  watch(lang, (newLang) => {
    localStorage.setItem('lang', newLang)
  })

  init()

  return {
    theme,
    lang,
    user,
    token,
    setTheme,
    setLang,
    setUser,
    setToken,
    clearUser,
    init
  }
}, {
  persist: {
    key: 'user_',
    storage: localStorage
  }
})
