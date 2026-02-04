<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="card w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      
      <div class="bg-blue-600 py-12 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div class="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div class="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full blur-2xl"></div>
        </div>

        <div class="bg-white p-4 rounded-full shadow-lg z-10 mb-2">
          <span class="text-4xl">🏨</span>
        </div>

        <h1 class="text-2xl font-black text-white z-10 tracking-wider">HTLfix</h1>
        <p class="text-blue-200 text-xs font-bold uppercase tracking-[0.2em] mt-1 z-10">
          SISTEMA OPERATIVO HOTEL
        </p>
      </div>

      <div class="card-body p-6">
        <div v-if="msg" class="alert alert-error text-sm mb-4 text-white font-bold p-2 rounded animate-pulse">
          ⚠️ {{ msg }}
        </div>

        <div v-if="step === 'hotel-gate'">
          <div class="flex border-b border-gray-200 mb-4">
            <button class="flex-1 pb-2 font-bold text-sm transition-colors" 
                    :class="mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'" 
                    @click="mode = 'login'">ACCEDI</button>
            <button class="flex-1 pb-2 font-bold text-sm transition-colors" 
                    :class="mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'" 
                    @click="mode = 'register'">NUOVO HOTEL</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Nome Hotel</label>
              <input v-model="hotelName" type="text" placeholder="Es. Hotel Roma" class="input input-bordered input-sm w-full font-bold" />
            </div>
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Password Hotel</label>
              <input v-model="hotelPass" type="password" placeholder="Password segreta" class="input input-bordered input-sm w-full font-bold" />
            </div>

            <div v-if="mode === 'register'" class="bg-blue-50 p-3 rounded border border-blue-100 text-center">
              <p class="text-xs text-blue-800">Il tuo <b>PIN Direttore</b> sarà:</p>
              <p class="text-3xl font-black text-blue-600 my-1 tracking-widest">9999</p>
            </div>

            <button v-if="mode === 'login'" @click="loginHotel" class="btn btn-primary w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Accesso in corso...' : 'ENTRA NELL\'HOTEL' }}
            </button>
            <button v-else @click="registerHotel" class="btn btn-secondary w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Creazione...' : 'CREA IL TUO HOTEL' }}
            </button>
          </div>
        </div>

        <div v-if="step === 'role-gate'">
          <div class="text-center mb-6">
             <h2 class="text-xl font-black text-gray-800 uppercase">{{ currentHotelData.name }}</h2>
             <div class="badge badge-success text-white text-[10px] font-bold px-2 py-1 mt-1 uppercase">Hotel Connesso</div>
          </div>
          
          <p class="text-center text-gray-400 mb-2 text-xs font-bold uppercase tracking-widest">Inserisci il tuo PIN</p>
          
          <input v-model="userPin" 
                 type="password" 
                 placeholder="****" 
                 class="input input-bordered w-full text-center text-4xl tracking-[0.5em] mb-6 font-black h-16 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all" 
                 maxlength="4" 
                 inputmode="numeric" 
                 @keyup.enter="loginUser" />
          
          <button @click="loginUser" class="btn btn-primary w-full mb-2 h-12 text-lg shadow-xl hover:scale-[1.02] transition-transform">
            TIMBRA CARTELLINO 🚀
          </button>
          
          <button @click="step = 'hotel-gate'; userPin=''" class="btn btn-ghost btn-xs w-full text-gray-400">
            Cambia Hotel
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const step = ref('hotel-gate') 
const mode = ref('login')
const loading = ref(false)
const msg = ref('')
const hotelName = ref(''); const hotelPass = ref(''); const userPin = ref('')
const currentHotelData = ref(null)

// --- GESTIONE HOTEL (Fase 1) ---
const registerHotel = async () => {
  if (!hotelName.value || !hotelPass.value) { msg.value = 'Compila tutti i campi!'; return }
  loading.value = true
  const { data, error } = await supabase.from('hotels').insert([{ name: hotelName.value, password: hotelPass.value }]).select()
  loading.value = false
  if (error) msg.value = 'Nome hotel già esistente. Provane un altro.'
  else enterHotel(data[0])
}

const loginHotel = async () => {
  loading.value = true; msg.value = ''
  const { data, error } = await supabase.from('hotels').select('*').eq('name', hotelName.value).eq('password', hotelPass.value).single()
  loading.value = false
  if (error || !data) msg.value = 'Nome Hotel o Password errati.'
  else enterHotel(data)
}

const enterHotel = (hotelData) => {
  localStorage.setItem('htlfix_hotel_id', hotelData.id)
  currentHotelData.value = hotelData
  step.value = 'role-gate'
}

// --- GESTIONE UTENTE (Fase 2 - IL CUORE DEL LOGIN) ---
const loginUser = async () => {
  const pin = userPin.value
  const h = currentHotelData.value
  localStorage.setItem('htlfix_hotel_name', h.name) 
  msg.value = ''

  // 1. PRIMA DI TUTTO: Cerchiamo nella tabella STAFF (Camerieri, Manutentori, Receptionist specifici)
  // Questo garantisce che Marco (Reception) vada in Reception e Elena (Staff) vada in Staff
  const { data: staffMember } = await supabase.from('staff_members')
    .select('*')
    .eq('hotel_id', h.id)
    .eq('pin', pin)
    .single()

  if (staffMember) {
    // Abbiamo trovato un dipendente! Salviamo i dati
    localStorage.setItem('htlfix_user', staffMember.role)
    localStorage.setItem('htlfix_user_name', staffMember.name) // Fondamentale per il "Ciao Nome"
    
    // SMISTAMENTO INTELLIGENTE
    switch (staffMember.role) {
      case 'staff':
        router.push('/staff')       // Cameriera -> Pagina Blu
        break
      case 'reception':
        router.push('/reception')   // Receptionist -> Pagina Viola
        break
      case 'maintenance':
        router.push('/manutenzione') // Tecnico -> Pagina Arancione
        break
      case 'governante':
        router.push('/governante')   // Capo -> Pagina Rosa
        break
      default:
        msg.value = 'Ruolo non riconosciuto: ' + staffMember.role
    }
    return
  } 

  // 2. SE NON È NELLO STAFF: Controlliamo se è il DIRETTORE (Admin)
  if (pin === '9999' || pin === h.admin_pin) { 
    localStorage.setItem('htlfix_user', 'admin')
    router.push('/admin')
    return 
  }

  // 3. SE NON È NESSUNO DEI DUE: Errore
  msg.value = 'PIN non valido.'
  userPin.value = ''
}
</script>