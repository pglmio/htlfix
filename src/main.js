import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Importazione dei Componenti
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ReceptionDashboard from './components/ReceptionDashboard.vue'
import GovernanteDashboard from './components/GovernanteDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue'
import MaintenanceDashboard from './components/MaintenanceDashboard.vue'

// Configurazione delle Rotte (Il "Navigatore" dell'App)
const routes = [
  { path: '/', component: LoginView },
  { path: '/admin', component: AdminDashboard },
  { path: '/reception', component: ReceptionDashboard },
  { path: '/governante', component: GovernanteDashboard },
  { path: '/staff', component: StaffDashboard },
  { path: '/manutenzione', component: MaintenanceDashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Controllo Accessi (Sicurezza base)
router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('htlfix_user')
  const hotelId = localStorage.getItem('htlfix_hotel_id')

  // Se non sei loggato in un hotel e non sei sulla pagina di login, torna indietro
  if (to.path !== '/' && !hotelId) {
    next('/')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')