import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js' // <--- Importante: importiamo il router appena creato

const app = createApp(App)

app.use(router) // <--- Importante: diciamo all'app di usarlo
app.mount('#app')