import { createRouter, createWebHistory } from 'vue-router'

// Importiamo le pagine che vedo nel tuo elenco file
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue'
import ReceptionDashboard from './components/ReceptionDashboard.vue'
import MaintenanceDashboard from './components/MaintenanceDashboard.vue'
import GovernanteDashboard from './components/GovernanteDashboard.vue'

// Definiamo gli indirizzi
const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/admin', name: 'Admin', component: AdminDashboard },
  { path: '/staff', name: 'Staff', component: StaffDashboard },
  { path: '/reception', name: 'Reception', component: ReceptionDashboard },
  { path: '/manutenzione', name: 'Maintenance', component: MaintenanceDashboard },
  { path: '/governante', name: 'Governante', component: GovernanteDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router