<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="card w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      
      <div class="bg-blue-600 p-4 text-center">
        <h1 class="text-2xl font-black text-white tracking-wider">HTLfix</h1>
        <p class="text-blue-100 text-xs uppercase">Gestionale Hotel Completo</p>
      </div>

      <div class="card-body p-6">
        
        <div v-if="msg" class="alert alert-error text-sm mb-4 text-white font-bold p-2 rounded">
          ⚠️ {{ msg }}
        </div>

        <div v-if="step === 'hotel-gate'">
          
          <div class="flex border-b border-gray-200 mb-4">
            <button class="flex-1 pb-2 font-bold text-sm" 
              :class="mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'"
              @click="mode = 'login'">ACCEDI</button>
            <button class="flex-1 pb-2 font-bold text-sm" 
              :class="mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'"
              @click="mode = 'register'">NUOVO HOTEL</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Nome Hotel</label>
              <input v-model="hotelName" type="text" placeholder="Es. Hotel Roma" class="input input-bordered input-sm w-full" />
            </div>
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Password Hotel</label>
              <input v-model="hotelPass" type="password" placeholder="Password segreta" class="input input-bordered input-sm w-full" />
            </div>

            <div v-if="mode === 'register'" class="bg-blue-50 p-3 rounded border border-blue-100">
              <p class="text-xs font-bold text-center mb-2 text-blue-800">IMPOSTA I PIN DEL PERSONALE</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="label text-[9px] font-bold text-gray-500">👑 DIRETTORE</label>
                  <input v-model="pins.admin" type="text" placeholder="9999" class="input input-bordered input-xs w-full font-mono text-center" maxlength="4"/>
                </div>
                <div>
                  <label class="label text-[9px] font-bold text-gray-500">🛎️ RECEPTION</label>
                  <input v-model="pins.reception" type="text" placeholder="1111" class="input input-bordered input-xs w-full font-mono text-center" maxlength="4"/>
                </div>
                <div>
                  <label class="label text-[9px] font-bold text-gray-500">🧹 CAMERIERA</label>
                  <input v-model="pins.staff" type="text" placeholder="0000" class="input input-bordered input-xs w-full font-mono text-center" maxlength="4"/>
                </div>
                <div>
                  <label class="label text-[9px] font-bold text-gray-500">🔧 MANUTENZIONE</label>
                  <input v-model="pins.maintenance" type="text" placeholder="2222" class="input input-bordered input-xs w-full font-mono text-center" maxlength="4"/>
                </div>
              </div>
            </div>

            <button v-if="mode === 'login'" @click="loginHotel" class="btn btn-primary w-full btn-sm mt-2" :disabled="loading">
              {{ loading ? 'Controllo...' : 'ENTRA NELL\'HOTEL' }}
            </button>

            <button v-else @click="registerHotel" class="btn btn-secondary w-full btn-sm mt-2" :disabled="loading">
              {{ loading ? 'Creo...' : 'CREA IL TUO HOTEL' }}
            </button>
          </div>
        </div>

        <div v-if="step === 'role-gate'">
          <div class="text-center mb-6">
             <h2 class="text-xl font-bold text-gray-800 uppercase">{{ currentHotelData.name }}</h2>
             <div class="badge badge-success text-white text-xs font-bold px-3 py-2 mt-1">Accesso Verificato</div>
          </div>

          <p class="text-center text-gray-400 mb-2 text-xs font-bold uppercase tracking-widest">Chi sei?</p>
          
          <input 
            v-model="userPin" 
            type="password" 
            placeholder="****" 
            class="input input-bordered w-full text-center text-4xl tracking-[0.5em] mb-6 font-black h-16 bg-gray-50" 
            maxlength="4" 
            inputmode="numeric"
          />
          
          <button @click="loginUser" class="btn btn-primary w-full mb-2 h-12 text-lg">ENTRA</button>
          <button @click="step = 'hotel-gate'" class="btn btn-ghost btn-xs w-full text-gray-400 hover:text-gray-600">Cambia Hotel</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

// STATI
const step = ref('hotel-gate') 
const mode = ref('login')
const loading = ref(false)
const msg = ref('')

// VARIABILI
const hotelName = ref('')
const hotelPass = ref('')
const userPin = ref('')

// OGGETTO PER I PIN IN FASE DI CREAZIONE
const pins = reactive({ 
  admin: '9999', 
  staff: '0000', 
  reception: '1111', 
  maintenance: '2222' 
})

const currentHotelData = ref(null)

// 1. REGISTRAZIONE NUOVO HOTEL
const registerHotel = async () => {
  if (!hotelName.value || !hotelPass.value || !pins.admin || !pins.staff) {
    msg.value = 'Compila tutti i campi!'
    return
  }
  loading.value = true
  msg.value = ''

  const { data, error } = await supabase
    .from('hotels')
    .insert([{ 
      name: hotelName.value, 
      password: hotelPass.value,
      admin_pin: pins.admin,
      staff_pin: pins.staff,
      reception_pin: pins.reception,
      maintenance_pin: pins.maintenance
    }])
    .select()

  loading.value = false

  if (error) {
    msg.value = 'Nome hotel già esistente. Provane un altro.'
  } else {
    enterHotel(data[0])
  }
}

// 2. LOGIN HOTEL ESISTENTE
const loginHotel = async () => {
  loading.value = true
  msg.value = ''

  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('name', hotelName.value)
    .eq('password', hotelPass.value)
    .single()

  loading.value = false

  if (error || !data) {
    msg.value = 'Nome Hotel o Password sbagliati'
  } else {
    enterHotel(data)
  }
}

// FUNZIONE DI APPOGGIO
const enterHotel = (hotelData) => {
  localStorage.setItem('htlfix_hotel_id', hotelData.id)
  currentHotelData.value = hotelData
  step.value = 'role-gate'
}

// 3. VERIFICA PIN E REINDIRIZZAMENTO
const loginUser = () => {
  const pin = userPin.value
  const h = currentHotelData.value
  
  // Salva il nome per le dashboard
  localStorage.setItem('htlfix_hotel_name', h.name) 

  if (pin === h.admin_pin) {
    localStorage.setItem('htlfix_user', 'admin')
    router.push('/admin')
  } else if (pin === h.staff_pin) {
    localStorage.setItem('htlfix_user', 'staff')
    router.push('/staff')
  } else if (pin === h.reception_pin) {
    localStorage.setItem('htlfix_user', 'reception')
    router.push('/reception')
  } else if (pin === h.maintenance_pin) {
    localStorage.setItem('htlfix_user', 'maintenance')
    router.push('/manutenzione')
  } else {
    msg.value = 'PIN Errato. Riprova.'
    userPin.value = '' // Pulisce il campo
  }
}
</script>