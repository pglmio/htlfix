import { createRouter, createWebHistory } from 'vue-router'

// 1. Importa la nuova Landing
import LandingView from './components/LandingView.vue'
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
// ... gli altri import che avevi già ...

const routes = [
  // 2. La strada principale "/" ora porta alla Landing
  { path: '/', name: 'Landing', component: LandingView },
  
  // 3. Cambiamo la strada del Login in "/app" o lasciamo così, 
  // ma dobbiamo assicurarci che la Landing sappia come portarci al Login.
  { path: '/login', name: 'Login', component: LoginView },
  
  { path: '/admin', name: 'Admin', component: AdminDashboard },
  // ... le altre rotte ...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router