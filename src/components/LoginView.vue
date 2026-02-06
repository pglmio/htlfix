<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative">
    
    <div class="card w-full max-w-md bg-white shadow-xl min-h-screen md:min-h-[600px] overflow-hidden">
      
      <div class="bg-[#707eff] py-10 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div class="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div class="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full blur-2xl"></div>
        </div>
        <img src="/logo.png" alt="HTLfix Logo" class="h-28 w-auto drop-shadow-2xl relative z-10 animate-pulse rounded-3xl" />
        <p class="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mt-4 relative z-10">HTLfix HOTEL ASSISTANT</p>
      </div>

      <div class="card-body p-6">
        <div v-if="msg" :class="msgType === 'error' ? 'alert-error text-white' : 'alert-success text-white'" class="alert text-sm mb-4 font-bold p-2 rounded shadow-sm flex items-center">
           <span>{{ msgType === 'error' ? '⚠️' : '✅' }} {{ msg }}</span>
        </div>

        <div v-if="step === 'hotel-gate'">
          <div class="flex border-b border-gray-200 mb-6">
            <button class="flex-1 pb-2 font-bold text-xs uppercase tracking-wider transition-colors" :class="mode === 'login' ? 'text-[#707eff] border-b-2 border-[#707eff]' : 'text-gray-400 hover:text-gray-500'" @click="mode = 'login'">
              Accedi Hotel
            </button>
            <button class="flex-1 pb-2 font-bold text-xs uppercase tracking-wider transition-colors" :class="mode === 'register' ? 'text-[#707eff] border-b-2 border-[#707eff]' : 'text-gray-400 hover:text-gray-500'" @click="mode = 'register'">
              Riscatta Invito
            </button>
          </div>

          <div v-if="mode === 'login'" class="space-y-4 animate-fade-in">
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Nome Hotel</label>
              <input v-model="hotelName" type="text" placeholder="Es. Hotel Roma" class="input input-bordered input-sm w-full font-bold text-gray-700" />
            </div>
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Password Hotel</label>
              <input v-model="hotelPass" type="password" placeholder="Password condivisa staff" class="input input-bordered input-sm w-full" />
            </div>
            <button @click="loginHotel" class="btn bg-[#707eff] hover:bg-[#5a65cc] text-white border-none w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Verifica...' : 'ENTRA NELL\'HOTEL' }}
            </button>
          </div>

          <div v-else class="space-y-3 animate-fade-in">
            <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-2">
              <p class="text-xs text-yellow-800 text-center font-bold">Usa il codice ricevuto via email per attivare il tuo Hotel.</p>
            </div>
            <div class="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">1. Il tuo Codice</h4>
                <input v-model="inviteCode" type="text" placeholder="HTL-XXXX-XXXX" class="input input-bordered input-sm w-full border-blue-300 bg-white font-mono font-bold text-blue-800 placeholder-blue-200 uppercase" />
            </div>
            <div class="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">2. Configura Hotel</h4>
                <input v-model="newHotelName" type="text" placeholder="Nome Hotel (Es. Hotel Milano)" class="input input-bordered input-sm w-full" />
                <input v-model="newHotelPass" type="password" placeholder="Crea Password Staff" class="input input-bordered input-sm w-full" />
            </div>
            <div class="text-center mt-1">
               <p class="text-[10px] text-gray-400">Verrai registrato come Direttore. PIN Default: <b class="text-gray-800">9999</b></p>
            </div>
            <button @click="handleFullRegistration" class="btn bg-black hover:bg-gray-800 text-white border-none w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Attivazione in corso...' : 'ATTIVA E CREA HOTEL' }}
            </button>
          </div>
        </div>

        <div v-if="step === 'role-gate'">
          <div class="text-center mb-6">
             <h2 class="text-xl font-bold text-gray-800 uppercase tracking-tight">{{ currentHotelData.name }}</h2>
             <div class="badge badge-success text-white text-[10px] font-bold px-3 py-1 mt-1 shadow-sm">CONNESSIONE STABILITA</div>
          </div>
          <p class="text-center text-gray-400 mb-2 text-xs font-bold uppercase tracking-widest">Inserisci il tuo PIN Personale</p>
          <input v-model="userPin" type="password" placeholder="****" class="input input-bordered w-full text-center text-4xl tracking-[0.5em] mb-6 font-black h-16 bg-gray-50 focus:bg-white focus:border-[#707eff] transition-all" maxlength="4" inputmode="numeric" @keyup.enter="loginUser" />
          <button @click="loginUser" class="btn bg-[#707eff] hover:bg-[#5a65cc] text-white border-none w-full mb-3 h-12 text-lg font-bold shadow-md">
            {{ loading ? 'Accesso...' : 'ENTRA' }}
          </button>
          <button @click="step = 'hotel-gate'; userPin = '';" class="btn btn-ghost btn-xs w-full text-gray-400 hover:bg-transparent">Cambia Hotel</button>
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
const msgType = ref('error')

const hotelName = ref('')
const hotelPass = ref('')
const inviteCode = ref('')
const newHotelName = ref('')
const newHotelPass = ref('')
const userPin = ref('')
const currentHotelData = ref(null)

// --- REGISTRAZIONE ---
const handleFullRegistration = async () => {
  if (!inviteCode.value || !newHotelName.value || !newHotelPass.value) {
    showMsg('Compila tutti i campi.', 'error'); return;
  }
  loading.value = true
  msg.value = ''
  
  const cleanCode = inviteCode.value.trim().toUpperCase()

  try {
    const { data: codeData, error: codeError } = await supabase.from('access_codes').select('*').eq('code', cleanCode).single()

    if (codeError || !codeData) throw new Error("Codice non trovato.")
    if (codeData.is_used === true) throw new Error("Codice GIÀ utilizzato!")

    // Crea Hotel
    const { data: hotelData, error: hotelError } = await supabase.from('hotels').insert([{ name: newHotelName.value, password: newHotelPass.value }]).select().single()

    if (hotelError) {
      if (hotelError.code === '23505') throw new Error("Nome hotel già esistente.")
      throw hotelError
    }

    // Brucia codice
    await supabase.from('access_codes').update({ is_used: true, hotel_id: hotelData.id, used_at: new Date() }).eq('id', codeData.id)

    // Crea Direttore
    const { error: staffError } = await supabase.from('staff_members').insert([{
        hotel_id: hotelData.id,
        name: 'Direttore',
        role: 'admin',
        pin: '9999' // Assicurati che su Supabase PIN sia di tipo TEXT
    }])
    
    if (staffError) throw staffError

    showMsg('Hotel creato! Usa il PIN 9999.', 'success')
    
    // Pulizia preventiva
    localStorage.clear() 
    enterHotel(hotelData)

  } catch (err) {
    console.error(err)
    showMsg(err.message, 'error')
  } finally {
    loading.value = false
  }
}

// --- LOGIN HOTEL ---
const loginHotel = async () => {
  if(!hotelName.value || !hotelPass.value) { showMsg('Dati mancanti', 'error'); return }
  loading.value = true; msg.value = ''
  
  // Pulizia preventiva per evitare fantasmi
  localStorage.clear()

  try {
    const { data, error } = await supabase.from('hotels').select('*').eq('name', hotelName.value).eq('password', hotelPass.value).single()
    if (error || !data) throw new Error('Credenziali hotel errate.')
    enterHotel(data)
  } catch (e) {
    showMsg(e.message, 'error')
  } finally {
    loading.value = false
  }
}

// --- LOGIN PIN ---
const loginUser = async () => {
  if (!userPin.value) return
  loading.value = true
  const h = currentHotelData.value
  
  try {
    const { data: staffMember, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('hotel_id', h.id)
      .eq('pin', userPin.value)
      .single()

    if (error || !staffMember) throw new Error('PIN errato.')

    localStorage.setItem('htlfix_hotel_id', h.id)
    localStorage.setItem('htlfix_hotel_name', h.name) 
    localStorage.setItem('htlfix_user_role', staffMember.role)
    localStorage.setItem('htlfix_user_name', staffMember.name)

    // Router Push
    if (staffMember.role === 'admin') router.push('/admin')
    else if (staffMember.role === 'reception') router.push('/reception')
    else if (staffMember.role === 'staff') router.push('/staff')
    else if (staffMember.role === 'maintenance') router.push('/manutenzione')
    else if (staffMember.role === 'governante') router.push('/governante')

  } catch (e) {
    showMsg('PIN errato.', 'error')
    userPin.value = ''
  } finally {
    loading.value = false
  }
}

const enterHotel = (hotelData) => {
  currentHotelData.value = hotelData
  step.value = 'role-gate'
  msg.value = ''
}

const showMsg = (message, type = 'error') => {
    msg.value = message
    msgType.value = type
    setTimeout(() => msg.value = '', 4000)
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>