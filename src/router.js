import { createRouter, createWebHistory } from 'vue-router'

// Importiamo i file CON I NOMI UFFICIALI che vedo nel tuo screenshot
import LandingView from './components/LandingView.vue'
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue' // <--- USA QUESTO NOME

const routes = [
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/login', name: 'Login', component: LoginView },
  
  // Colleghiamo la rotta /admin al file AdminDashboard.vue
  { path: '/admin', name: 'Admin', component: AdminDashboard } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router