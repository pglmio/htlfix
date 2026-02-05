<template>
  <WelcomePay v-if="showWelcome" @enter-app="showWelcome = false" />

  <LoginView v-else />
</template>

<script setup>
import { ref } from 'vue'
// Assicurati che i percorsi siano corretti (src/components/...)
import LoginView from './components/LoginView.vue'
import WelcomePay from './components/WelcomePay.vue'

// Di default mostra la pagina di benvenuto/pagamento
const showWelcome = ref(true)
</script>