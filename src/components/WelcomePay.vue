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
        <p class="text-gray-400 mt-2 text-center max-w-sm">Sistema operativo per hotel. <br>Dal caos all'efficienza.</p>
      </div>

      <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        <div class="text-center mb-6 border-b border-white/10 pb-6">
          <span class="bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white uppercase tracking-widest">Early Access</span>
          <div class="flex items-center justify-center mt-3">
            <span class="text-4xl font-bold">€29</span>
            <span class="text-gray-400 ml-2 text-sm">/ mese</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Fatturazione automatica. Disdici quando vuoi.</p>
        </div>

        <div class="space-y-3">
          <button @click="goToStripe" class="w-full bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center hover:bg-gray-100 transition">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l2.84-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" fill="#EA4335"/></svg>
            Registrati con Google
          </button>

          <button @click="goToStripe" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition">
            Registrati con Email
          </button>
        </div>

        <div class="mt-6 text-center">
          <button @click="$emit('enter-app')" class="text-sm text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4 transition">
            Ho già un codice invito? Accedi qui
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
             <p><strong>1. Servizio:</strong> HTLfix è un software as a service fornito "così com'è".</p>
             <p><strong>2. Pagamento:</strong> L'abbonamento di €29 è mensile e si rinnova automaticamente.</p>
             <p><strong>3. Codice Invito:</strong> Il pagamento dà diritto a ricevere un codice univoco via email.</p>
           </div>
           <div v-if="activeModal === 'privacy'">
             <p>I tuoi dati sono sacri. Usiamo Supabase (Server EU) e Stripe per i pagamenti. Non vendiamo i tuoi dati.</p>
           </div>
           <div v-if="activeModal === 'cookie'">
             <p>Usiamo solo cookie tecnici essenziali per il funzionamento dell'app. Niente tracciamento pubblicitario.</p>
           </div>
        </div>
        <div class="p-4 border-t border-gray-800 text-center">
          <button @click="activeModal = null" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">Ho capito</button>
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
  // INSERISCI QUI IL TUO LINK STRIPE REALE
  window.location.href = 'https://buy.stripe.com/TUO_LINK_QUI'
}
</script>