<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="card w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      
      <div class="bg-blue-600 py-10 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div class="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
           <div class="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full blur-2xl"></div>
        </div>

        <img src="/logo.png" alt="HTLfix Logo" class="h-28 w-auto drop-shadow-2xl relative z-10 animate-pulse rounded-3xl" />

        <p class="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mt-4 relative z-10">
          HTLfix HOTEL ASSISTANT
        </p>
      </div>

      <div class="card-body p-6">
        <div v-if="msg" :class="msgType === 'error' ? 'alert-error text-white' : 'alert-success text-white'" class="alert text-sm mb-4 font-bold p-2 rounded shadow-sm">
           {{ msgType === 'error' ? '⚠️' : '✅' }} {{ msg }}
        </div>

        <div v-if="step === 'hotel-gate'">
          <div class="flex border-b border-gray-200 mb-6">
            <button class="flex-1 pb-2 font-bold text-xs uppercase tracking-wider" :class="mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-500'" @click="mode = 'login'">
              Accedi Hotel
            </button>
            <button class="flex-1 pb-2 font-bold text-xs uppercase tracking-wider" :class="mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-500'" @click="mode = 'register'">
              Riscatta Invito
            </button>
          </div>

          <div v-if="mode === 'login'" class="space-y-4 animate-fade-in">
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Nome Hotel</label>
              <input v-model="hotelName" type="text" placeholder="Es. Hotel Roma" class="input input-bordered input-sm w-full font-bold text-gray-700" />
            </div>
            <div>
              <label class="label text-[10px] font-bold text-gray-500 uppercase">Password Operativa Hotel</label>
              <input v-model="hotelPass" type="password" placeholder="Password condivisa" class="input input-bordered input-sm w-full" />
            </div>
            <button @click="loginHotel" class="btn btn-primary w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Accesso in corso...' : 'ENTRA NELL\'HOTEL' }}
            </button>
          </div>

          <div v-else class="space-y-3 animate-fade-in">
            <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-2">
                <p class="text-xs text-yellow-800 text-center font-bold">Hai un codice invito? Crea il tuo account Owner e il tuo primo Hotel ora.</p>
            </div>

            <div class="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dati Proprietario</h4>
                <input v-model="registerEmail" type="email" placeholder="La tua Email (Owner)" class="input input-bordered input-xs w-full" />
                <input v-model="registerUserPass" type="password" placeholder="Tua Password Personale" class="input input-bordered input-xs w-full" />
                <input v-model="inviteCode" type="text" placeholder="CODICE INVITO (Es. HTL-9922)" class="input input-bordered input-sm w-full border-blue-300 bg-white font-mono font-bold text-blue-800 placeholder-blue-300 uppercase" />
            </div>

            <div class="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dati Primo Hotel</h4>
                <input v-model="hotelName" type="text" placeholder="Nome Hotel (Es. Hotel Roma)" class="input input-bordered input-xs w-full" />
                <input v-model="hotelPass" type="password" placeholder="Crea Password Hotel (Condivisa Staff)" class="input input-bordered input-xs w-full" />
            </div>

            <div class="text-center mt-1">
               <p class="text-[10px] text-gray-400">PIN Direttore Default: <b class="text-gray-800">9999</b></p>
            </div>

            <button @click="handleFullRegistration" class="btn btn-secondary w-full btn-sm mt-2 shadow-lg" :disabled="loading">
              {{ loading ? 'Verifica e Configurazione...' : 'RISCATTA E CREA HOTEL' }}
            </button>
          </div>
        </div>

        <div v-if="step === 'role-gate'">
          <div class="text-center mb-6">
             <h2 class="text-xl font-bold text-gray-800 uppercase tracking-tight">{{ currentHotelData.name }}</h2>
             <div class="badge badge-success text-white text-[10px] font-bold px-3 py-1 mt-1 shadow-sm">CONNESSIONE SICURA</div>
          </div>
          <p class="text-center text-gray-400 mb-2 text-xs font-bold uppercase tracking-widest">Inserisci il tuo PIN</p>
          <input v-model="userPin" type="password" placeholder="****" class="input input-bordered w-full text-center text-4xl tracking-[0.5em] mb-6 font-black h-16 bg-gray-50 focus:bg-white transition-all" maxlength="4" inputmode="numeric" @keyup.enter="loginUser" />
          
          <button @click="loginUser" class="btn btn-primary w-full mb-3 h-12 text-lg font-bold shadow-md">ENTRA</button>
          <button @click="step = 'hotel-gate'" class="btn btn-ghost btn-xs w-full text-gray-400 hover:bg-transparent">Cambia Hotel</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase' // Assicurati che il percorso sia corretto

const router = useRouter()
const step = ref('hotel-gate') 
const mode = ref('login')
const loading = ref(false)
const msg = ref('')
const msgType = ref('error')

// Dati Login Hotel
const hotelName = ref('')
const hotelPass = ref('')

// Dati Registrazione (Owner + Codice)
const registerEmail = ref('')
const registerUserPass = ref('')
const inviteCode = ref('')

// Dati Accesso Ruolo
const userPin = ref('')
const currentHotelData = ref(null)

// --- LOGICA REGISTRAZIONE COMPLETA (Levels Style) ---
const handleFullRegistration = async () => {
  // 1. Validazione Base
  if (!registerEmail.value || !registerUserPass.value || !inviteCode.value || !hotelName.value || !hotelPass.value) {
    showMsg('Compila tutti i campi: Dati Utente, Codice e Dati Hotel.', 'error'); return;
  }

  loading.value = true
  msg.value = ''

  try {
    // 2. Controlla Validità Codice (Senza bruciarlo ancora)
    const { data: codeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', inviteCode.value)
      .eq('is_used', false)
      .single()

    if (codeError || !codeData) throw new Error("Codice invito non valido o già utilizzato.")

    // 3. Crea Utente Owner su Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registerEmail.value,
      password: registerUserPass.value
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Errore durante la creazione dell'utente.")

    const userId = authData.user.id

    // 4. CHECK CRITICO: L'utente ha già hotel? (Ridondante qui perché è nuovo, ma buona pratica)
    const { count } = await supabase
        .from('hotels')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)

    if (count >= 1) throw new Error("Questo account ha già un hotel associato.")

    // 5. CREA L'HOTEL (Collegato all'Owner)
    const { data: hotelData, error: hotelInsertError } = await supabase
      .from('hotels')
      .insert([{ 
        name: hotelName.value, 
        password: hotelPass.value,
        owner_id: userId // Collega l'hotel all'utente
      }])
      .select()
      .single()

    if (hotelInsertError) {
        // Se fallisce (es. nome hotel duplicato), "puliamo" visualmente o diamo errore
        if (hotelInsertError.code === '23505') throw new Error("Esiste già un hotel con questo nome.")
        throw hotelInsertError
    }

    // 6. BRUCIA IL CODICE (RPC call)
    await supabase.rpc('claim_access_code', { 
        input_code: inviteCode.value, 
        user_id: userId 
    })

    // 7. Successo! Entra direttamente
    showMsg('Hotel creato con successo! Benvenuto.', 'success')
    enterHotel(hotelData)

  } catch (err) {
    console.error(err)
    showMsg(err.message || "Si è verificato un errore.", 'error')
  } finally {
    loading.value = false
  }
}

// --- LOGICA LOGIN CLASSICA (Staff/Reception) ---
const loginHotel = async () => {
  if(!hotelName.value || !hotelPass.value) { showMsg('Inserisci nome e password hotel', 'error'); return }
  
  loading.value = true; msg.value = ''
  
  // Cerca l'hotel
  const { data, error } = await supabase.from('hotels').select('*').eq('name', hotelName.value).eq('password', hotelPass.value).single()
  
  loading.value = false
  if (error || !data) showMsg('Credenziali hotel errate.', 'error')
  else enterHotel(data)
}

// --- FUNZIONI COMUNI ---
const enterHotel = (hotelData) => {
  localStorage.setItem('htlfix_hotel_id', hotelData.id)
  currentHotelData.value = hotelData
  step.value = 'role-gate'
  msg.value = ''
}

const loginUser = async () => {
  const pin = userPin.value
  const h = currentHotelData.value
  localStorage.setItem('htlfix_hotel_name', h.name) 

  // PIN Hardcoded (Come da tuo codice originale)
  if (pin === h.admin_pin || pin === '9999') { // 9999 è il default fallback
      localStorage.setItem('htlfix_user', 'admin'); 
      router.push('/admin'); return 
  } 
  if (pin === h.reception_pin) { 
      localStorage.setItem('htlfix_user', 'reception'); 
      router.push('/reception'); return 
  }

  // PIN Staff (Database)
  const { data: staffMember } = await supabase.from('staff_members').select('*').eq('hotel_id', h.id).eq('pin', pin).single()

  if (staffMember) {
    localStorage.setItem('htlfix_user', staffMember.role)
    localStorage.setItem('htlfix_user_name', staffMember.name)
    if (staffMember.role === 'staff') router.push('/staff')
    else if (staffMember.role === 'maintenance') router.push('/manutenzione')
    else if (staffMember.role === 'governante') router.push('/governante')
  } else {
    showMsg('PIN non riconosciuto.', 'error'); userPin.value = ''
  }
}

const showMsg = (message, type = 'error') => {
    msg.value = message
    msgType.value = type
    setTimeout(() => msg.value = '', 4000)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>