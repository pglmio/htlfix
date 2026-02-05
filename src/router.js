import { createRouter, createWebHistory } from 'vue-router'

// 1. Importiamo le pagine (Assicurati che i nomi dei file siano identici!)
import LandingView from './components/LandingView.vue'
import LoginView from './components/LoginView.vue' 

const routes = [
  // La Landing Page (Vetrina)
  { path: '/', name: 'Landing', component: LandingView },
  
  // La Login (Ingresso App) - QUESTA È QUELLA CHE TI SERVE
  { path: '/login', name: 'Login', component: LoginView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router