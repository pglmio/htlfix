<template>
  <div class="min-h-screen bg-gray-900 flex flex-col font-sans text-white relative overflow-hidden">
    
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
    </div>

    <div class="flex-grow flex flex-col items-center justify-center z-10 px-4">
      
      <div class="flex flex-col items-center mb-8">
        <div class="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10 mb-4 shadow-2xl">
           <img src="/logo.png" alt="HTLfix Logo" class="w-20 h-20 rounded-2xl object-cover">
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-center">
          HTLfix <span class="text-blue-500">Hotel Assistant</span>
        </h1>
        <p class="text-gray-400 mt-2 text-center max-w-sm">
          Sistema operativo per hotel.<br>Semplice. Veloce. Essenziale.
        </p>
      </div>

      <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        
        <div class="mb-8">
          <span class="bg-green-500 text-black text-xs font-black px-2 py-1 rounded uppercase tracking-widest">Accesso Pro</span>
          <div class="flex items-center justify-center mt-4">
            <span class="text-5xl font-black text-white">€29</span>
            <span class="text-gray-400 ml-2 text-lg">/ mese</span>
          </div>
          <p class="text-sm text-gray-400 mt-2">Disdici in qualsiasi momento.</p>
        </div>

        <button @click="goToStripe" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center group">
          <span>Acquista Ora</span>
          <svg class="w-6 h-6 ml-2 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>
        
        <p class="text-xs text-gray-500 mt-4 leading-relaxed">
          Pagamento sicuro via Stripe. Riceverai il tuo <b>Codice Invito</b> via email subito dopo l'acquisto.
        </p>

        <div class="mt-8 pt-6 border-t border-white/10">
          <button @click="$emit('enter-app')" class="text-sm text-gray-300 hover:text-white font-medium underline decoration-gray-600 underline-offset-4 transition">
            Ho già ricevuto il codice? Entra qui
          </button>
        </div>
      </div>
    </div>

    <div class="z-10 py-4 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div class="flex justify-center space-x-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        <button @click="activeModal = 'terms'" class="hover:text-white transition">Termini</button>
        <button @click="activeModal = 'privacy'" class="hover:text-white transition">Privacy</button>
        <button @click="activeModal = 'cookie'" class="hover:text-white transition">Cookie</button>
      </div>
    </div>

    <div v-if="activeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="activeModal = null">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        <div class="p-4 border-b border-gray-800 flex justify-between items-center">
           <h3 class="font-bold text-white">{{ getTitle(activeModal) }}</h3>
           <button @click="activeModal = null" class="text-gray-400 hover:text-white">✕</button>
        </div>
        <div class="p-6 overflow-y-auto text-sm text-gray-300 space-y-4 leading-relaxed">
           <div v-if="activeModal === 'terms'">
             <p><strong>1. Servizio:</strong> HTLfix è un software as a service.</p>
             <p><strong>2. Pagamento:</strong> €29 mensili ricorrenti.</p>
           </div>
           <div v-if="activeModal === 'privacy'">
             <p>Non vendiamo i tuoi dati. Usiamo Stripe per i pagamenti sicuri.</p>
           </div>
           <div v-if="activeModal === 'cookie'">
             <p>Solo cookie tecnici essenziali.</p>
           </div>
        </div>
        <div class="p-4 border-t border-gray-800 text-center">
          <button @click="activeModal = null" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">Chiudi</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeModal = ref(null)

const getTitle = (type) => {
  if (type === 'terms') return 'Termini e Condizioni'
  if (type === 'privacy') return 'Privacy Policy'
  if (type === 'cookie') return 'Cookie Policy'
}

const goToStripe = () => {
  // ⚠️ IMPORTANTE: INCOLLA QUI SOTTO IL TUO LINK VERO DI STRIPE
  // Altrimenti vedrai l'errore "AccessDenied"
  window.location.href = 'https://buy.stripe.com/TUO_LINK_QUI'
}
</script>