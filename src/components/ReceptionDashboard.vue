<template>
  <div class="min-h-screen bg-purple-50 pb-20 relative">
    
    <div v-if="!audioEnabled" class="fixed inset-0 z-[999] bg-purple-900/95 flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm">
      <div class="text-6xl mb-6 animate-bounce">🛎️</div>
      <h2 class="text-3xl font-black mb-2">RECEPTION</h2>
      <p class="mb-8 font-bold opacity-80 max-w-xs mx-auto">Clicca per attivare la console.</p>
      <button @click="enableAudio" class="btn btn-white text-purple-900 font-black btn-lg shadow-xl hover:scale-105 transition-transform">
        INIZIA TURNO
      </button>
    </div>

    <div v-if="showToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-warning shadow-lg animate-bounce border-2 border-white">
        <span>🔔 <b>Nuovo Ticket!</b></span>
      </div>
    </div>

    <div class="navbar bg-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">RECEPTION</span>
      </div>
      <div class="flex items-center gap-3">
         <span class="text-xs font-bold opacity-60">{{ audioEnabled ? '🔊 ON' : '🔇 OFF' }}</span>
         <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
      </div>
    </div>

    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="room in rooms" :key="room.id" class="card shadow-sm border p-3 text-center transition-all bg-white relative overflow-visible">
        <div v-if="hasIssue(room.number)" class="absolute -top-2 -right-2 bg-yellow-400 text-black w-8 h-8 flex items-center justify-center rounded-full shadow-md font-bold text-lg animate-bounce z-10 border-2 border-white">⚠️</div>
        <h2 class="text-2xl font-black text-gray-800 mb-2">{{ room.number }}</h2>
        <div class="badge w-full font-bold text-white mb-3 py-3" :class="{'badge-success': room.status==='clean','badge-error': room.status==='dirty','badge-warning': room.status==='cleaning','badge-info': room.status==='occupied'}">
          {{ getStatusText(room.status) }}
        </div>
        <div class="flex flex-col gap-2">
          <button v-if="room.status === 'clean'" @click="setStatus(room, 'occupied')" class="btn btn-xs btn-outline btn-info">👤 CHECK-IN</button>
          <button v-if="room.status === 'occupied'" @click="setStatus(room, 'dirty')" class="btn btn-xs btn-outline btn-error">🚪 CHECK-OUT</button>
          <button @click="openIssueModal(room)" class="btn btn-xs btn-ghost text-gray-400 hover:text-yellow-600">Ticket ⚠️</button>
        </div>
      </div>
    </div>

    <dialog id="reception_issue_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4">⚠️ Ticket Stanza {{ selectedRoom?.number }}</h3>
        <div class="flex flex-col gap-3">
          <button @click="reportIssue('💡 Lampadina Rotta')" class="btn btn-outline w-full justify-start pl-6">💡 Lampadina Rotta</button>
          <button @click="reportIssue('📺 TV non funziona')" class="btn btn-outline w-full justify-start pl-6">📺 TV non va</button>
          <div class="flex gap-2">
            <input v-model="customIssue" type="text" placeholder="Descrivi..." class="input input-bordered w-full" />
            <button @click="reportIssue(customIssue)" class="btn btn-warning text-white">INVIA</button>
          </div>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full">Chiudi</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([]); const activeIssues = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'
const selectedRoom = ref(null); const customIssue = ref('')
const showToast = ref(false)
const audioEnabled = ref(false)
const lastIssueCount = ref(-1)
let pollingInterval = null

// --- NUOVI SUONI PIÙ AFFIDABILI ---
const playStartSound = () => {
  // Un "POP" morbido per l'inizio
  const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg')
  audio.volume = 0.5
  audio.play().catch(e => {})
}

const playNotifySound = () => {
  if (!audioEnabled.value) return
  // Un "BIP" corto e preciso
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  audio.volume = 1.0
  audio.play().catch(e => {})
}

const enableAudio = () => { audioEnabled.value = true; playStartSound() }

const fetchData = async () => {
  const { data: r } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (r && JSON.stringify(r) !== JSON.stringify(rooms.value)) rooms.value = r

  const { data: i } = await supabase.from('issues').select('room_number').eq('hotel_id', hotelId).eq('status', 'open')
  
  if (i) {
    const currentCount = i.length
    // LOGICA: Se i ticket AUMENTANO -> Bip Piccolo
    if (lastIssueCount.value !== -1 && currentCount > lastIssueCount.value) {
      showToast.value = true
      playNotifySound()
      setTimeout(() => showToast.value = false, 3000)
    }
    activeIssues.value = i.map(x => x.room_number)
    lastIssueCount.value = currentCount
  }
}

const setStatus = async (room, status) => { room.status = status; await supabase.from('rooms').update({ status: status }).eq('id', room.id) }
const reportIssue = async (desc) => { if (!desc) return; await supabase.from('issues').insert([{ description: desc, room_number: selectedRoom.value.number, hotel_id: hotelId, status: 'open' }]); document.getElementById('reception_issue_modal').close(); fetchData() }
const openIssueModal = (r) => { selectedRoom.value = r; customIssue.value = ''; document.getElementById('reception_issue_modal').showModal() }
const hasIssue = (n) => activeIssues.value.includes(n)
const getStatusText = (s) => (s==='clean'?'LIBERA':s==='dirty'?'SPORCA':s==='cleaning'?'IN PULIZIA':'OCCUPATA')
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { 
  fetchData()
  pollingInterval = setInterval(fetchData, 2000)
})
onUnmounted(() => clearInterval(pollingInterval))
</script>