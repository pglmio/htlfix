import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// IMPORT PAGINE
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue'
import ReceptionDashboard from './components/ReceptionDashboard.vue'
import MaintenanceDashboard from './components/MaintenanceDashboard.vue'
import GovernanteDashboard from './components/GovernanteDashboard.vue' // <--- NUOVA PAGINA

const routes = [
  { path: '/', component: LoginView },
  { path: '/admin', component: AdminDashboard },
  { path: '/staff', component: StaffDashboard },
  { path: '/reception', component: ReceptionDashboard },
  { path: '/manutenzione', component: MaintenanceDashboard },
  { path: '/governante', component: GovernanteDashboard }, // <--- NUOVA ROTTA
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// SICUREZZA (Redirect se non sei loggato)
router.beforeEach((to, from, next) => {
  const publicPages = ['/'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('htlfix_user');

  if (authRequired && !loggedIn) {
    next('/');
  } else {
    next();
  }
});

const app = createApp(App)
app.use(router)
app.mount('#app')