import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <--- Deve importare il file router.js
import './style.css'

const app = createApp(App)
app.use(router) // <--- Deve dire a Vue di usare il router
app.mount('#app')