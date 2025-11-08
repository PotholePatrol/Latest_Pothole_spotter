import { createRouter, createWebHistory } from 'vue-router'

// Page imports
import ContactPage from '../contact/Index.vue'
import AuthLayout from '../auth/Index.vue'
import LoginPage from '../auth/Login.vue'
import CallbackPage from '../auth/Callback.vue'
import SignupPage from '../auth/Signup.vue'
import ResetPasswordPage from '../auth/ResetPassword.vue'
import AboutPage from '../about/index.vue'
import ManualTrainPage from '../update/index.vue'
import TrainPage from '../train/index.vue'
import ProfilePage from '../profile/index.vue'
import HomeP from '../home/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeP,
  },
    {
    path: '/manual-train',
    name: 'HomeP',
    component: ManualTrainPage,
  },
  {
    path: '/train',
    name: 'Train',
    component: TrainPage,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
   {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login', 
        name: 'Login',
        component: LoginPage,
      },
      {
        path: 'signup', 
        name: 'Signup',
        component: SignupPage,
      },
      {
        path: 'reset-password', 
        name: 'ResetPassword',
        component: ResetPasswordPage,
      },
       {
        path: 'callback', 
        name: 'Callback',
        component: CallbackPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
