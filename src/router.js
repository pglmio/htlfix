import { createRouter, createWebHistory } from 'vue-router'

// 1. IMPORTIAMO TUTTI I FILE (Nomi presi dalla tua foto)
import LandingView from './components/LandingView.vue'
import LoginView from './components/LoginView.vue'
import RegisterView from './components/RegisterView.vue'

// Dashboard per i vari ruoli
import AdminDashboard from './components/AdminDashboard.vue'
import ReceptionDashboard from './components/ReceptionDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue'       // Per le Cameriere
import MaintenanceDashboard from './components/MaintenanceDashboard.vue' // Per i Manutentori
import GovernanteDashboard from './components/GovernanteDashboard.vue'   // Per la Governante
import CreatorDashboard from './components/CreatorDashboard.vue'   // Per te (Super Admin)

const routes = [
  // Rotte Pubbliche
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },

  // Rotte Protette (Dashboard)
  { path: '/admin', name: 'Admin', component: AdminDashboard },
  { path: '/reception', name: 'Reception', component: ReceptionDashboard },
  { path: '/staff', name: 'Staff', component: StaffDashboard },
  
  // Nota: Uso '/manutenzione' perché nel login avevamo messo router.push('/manutenzione')
  { path: '/manutenzione', name: 'Maintenance', component: MaintenanceDashboard },
  
  { path: '/governante', name: 'Governante', component: GovernanteDashboard },
  { path: '/creator', name: 'Creator', component: CreatorDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router