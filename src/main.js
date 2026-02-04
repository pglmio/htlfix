import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Importazione Componenti
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ReceptionDashboard from './components/ReceptionDashboard.vue'
import GovernanteDashboard from './components/GovernanteDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue'
import MaintenanceDashboard from './components/MaintenanceDashboard.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/admin', component: AdminDashboard },
  { path: '/reception', component: ReceptionDashboard },     // Reception -> Reception
  { path: '/governante', component: GovernanteDashboard },   // Governante -> Governante
  { path: '/staff', component: StaffDashboard },             // Staff -> STAFF (Controlla questa riga!)
  { path: '/manutenzione', component: MaintenanceDashboard }, // Manutenzione -> Manutenzione
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const hotelId = localStorage.getItem('htlfix_hotel_id')
  if (to.path !== '/' && !hotelId) next('/')
  else next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')