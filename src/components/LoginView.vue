<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="card w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      
      <div class="bg-blue-600 py-12 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div class="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div class="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full blur-2xl"></div>
        </div>

        <img src="/logo.png" alt="HTLfix Logo" class="h-32 w-auto drop-shadow-2xl relative z-10 animate-pulse rounded-3xl" />

        <p class="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mt-4 relative z-10">
          HTLfix HOTEL ASSISTANT
        </p>
      </div>

      <div class="card-body p-6">
        <div v-if="msg" class="alert alert-error text-sm mb-4 text-white font-bold p-2 rounded">⚠️ {{ msg }}</div>

        <div v-if="step === 'hotel-gate'">
          <div class="flex border-b border-gray-200 mb-4">
            <button class="flex-1 pb-2 font-bold text-sm" :class="mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'" @click="mode = 'login'">ACCEDI</button>
            <button class="flex-1 pb-2 font-bold text-sm" :class="mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'" @click="mode = 'register'">NUOVO HOTEL</button>
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

            <div v-if="mode === 'register'" class="bg-blue-50 p-3 rounded border border-blue-100 text-center">
              <p class="text-xs text-blue-800">Registrandoti, il tuo <b>PIN Direttore</b> sarà:</p>
              <p class="text-3xl font-black text-blue-600 my-1 tracking-widest">9999</p>
            </div>

            <button v-if="mode === 'login'" @click="loginHotel" class="btn btn-primary w-full btn-sm mt-2" :disabled="loading">{{ loading ? '...' : 'ENTRA NELL\'HOTEL' }}</button>
            <button v-else @click="registerHotel" class="btn btn-secondary w-full btn-sm mt-2" :disabled="loading">{{ loading ? '...' : 'CREA IL TUO HOTEL' }}</button>
          </div>
        </div>

        <div v-if="step === 'role-gate'">
          <div class="text-center mb-6">
             <h2 class="text-xl font-bold text-gray-800 uppercase">{{ currentHotelData.name }}</h2>
             <div class="badge badge-success text-white text-xs font-bold px-3 py-2 mt-1">Accesso Verificato</div>
          </div>
          <p class="text-center text-gray-400 mb-2 text-xs font-bold uppercase tracking-widest">Inserisci il tuo PIN</p>
          <input v-model="userPin" type="password" placeholder="****" class="input input-bordered w-full text-center text-4xl tracking-[0.5em] mb-6 font-black h-16 bg-gray-50" maxlength="4" inputmode="numeric" />
          <button @click="loginUser" class="btn btn-primary w-full mb-2 h-12 text-lg">ENTRA</button>
          <button @click="step = 'hotel-gate'" class="btn btn-ghost btn-xs w-full text-gray-400">Cambia Hotel</button>
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

const registerHotel = async () => {
  if (!hotelName.value || !hotelPass.value) { msg.value = 'Compila tutto!'; return }
  loading.value = true
  const { data, error } = await supabase.from('hotels').insert([{ name: hotelName.value, password: hotelPass.value }]).select()
  loading.value = false
  if (error) msg.value = 'Nome hotel già esistente.'
  else enterHotel(data[0])
}

const loginHotel = async () => {
  loading.value = true; msg.value = ''
  const { data, error } = await supabase.from('hotels').select('*').eq('name', hotelName.value).eq('password', hotelPass.value).single()
  loading.value = false
  if (error || !data) msg.value = 'Dati errati'
  else enterHotel(data)
}

const enterHotel = (hotelData) => {
  localStorage.setItem('htlfix_hotel_id', hotelData.id)
  currentHotelData.value = hotelData
  step.value = 'role-gate'
}

const loginUser = async () => {
  const pin = userPin.value
  const h = currentHotelData.value
  localStorage.setItem('htlfix_hotel_name', h.name) 

  if (pin === h.admin_pin) { localStorage.setItem('htlfix_user', 'admin'); router.push('/admin'); return } 
  if (pin === h.reception_pin) { localStorage.setItem('htlfix_user', 'reception'); router.push('/reception'); return }

  const { data: staffMember } = await supabase.from('staff_members').select('*').eq('hotel_id', h.id).eq('pin', pin).single()

  if (staffMember) {
    localStorage.setItem('htlfix_user', staffMember.role)
    localStorage.setItem('htlfix_user_name', staffMember.name)
    if (staffMember.role === 'staff') router.push('/staff')
    else if (staffMember.role === 'maintenance') router.push('/manutenzione')
    else if (staffMember.role === 'governante') router.push('/governante')
  } else {
    msg.value = 'PIN non riconosciuto.'; userPin.value = ''
  }
}
</script>