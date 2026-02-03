import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Importiamo le pagine vere
import LoginView from './components/LoginView.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import StaffDashboard from './components/StaffDashboard.vue' // <--- IMPORTANTE

const routes = [
  { path: '/', component: LoginView },
  { path: '/admin', component: AdminDashboard },
  // Qui colleghiamo il file StaffDashboard che abbiamo appena creato
  { path: '/staff', component: StaffDashboard }, 
  { path: '/reception', component: { template: '<div>Reception</div>' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Sicurezza: controlla se sei loggato
router.beforeEach((to, from, next) => {
  const publicPages = ['/'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('htlfix_user');

  if (authRequired && !loggedIn) {
    return next('/');
  }

  next();
});

const app = createApp(App)
app.use(router)
app.mount('#app')