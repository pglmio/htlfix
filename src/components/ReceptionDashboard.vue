<template>
  <div class="min-h-screen bg-purple-50 pb-20">
    <div v-if="showToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-warning shadow-lg animate-bounce">
        <span>🔔 <b>Attenzione:</b> Nuovo Ticket Aperto!</span>
      </div>
    </div>

    <div class="navbar bg-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">RECEPTION</span>
      </div>
      <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow mr-4"></div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
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
const showToast = ref(false) // Stato per la notifica
let lastIssueCount = 0 // Memoria dei guasti precedenti
let pollingInterval = null

// SUONO NOTIFICA (Beep semplice)
const playSound = () => {
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  audio.play().catch(e => console.log('Audio bloccato dal browser', e))
}

const fetchData = async () => {
  const { data: r } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (r && JSON.stringify(r) !== JSON.stringify(rooms.value)) rooms.value = r

  const { data: i } = await supabase.from('issues').select('room_number').eq('hotel_id', hotelId).eq('status', 'open')
  
  if (i) {
    const currentCount = i.length
    // LOGICA NOTIFICA: Se i guasti sono AUMENTATI rispetto a prima -> NOTIFICA
    if (currentCount > lastIssueCount && lastIssueCount !== 0) {
      showToast.value = true
      playSound()
      setTimeout(() => showToast.value = false, 4000) // Nascondi dopo 4 sec
    }
    activeIssues.value = i.map(x => x.room_number)
    lastIssueCount = currentCount
  }
}

const setStatus = async (room, status) => { room.status = status; await supabase.from('rooms').update({ status: status }).eq('id', room.id) }
const reportIssue = async (desc) => { if (!desc) return; await supabase.from('issues').insert([{ description: desc, room_number: selectedRoom.value.number, hotel_id: hotelId, status: 'open' }]); document.getElementById('reception_issue_modal').close(); fetchData() }
const openIssueModal = (r) => { selectedRoom.value = r; customIssue.value = ''; document.getElementById('reception_issue_modal').showModal() }
const hasIssue = (n) => activeIssues.value.includes(n)
const getStatusText = (s) => (s==='clean'?'LIBERA':s==='dirty'?'SPORCA':s==='cleaning'?'IN PULIZIA':'OCCUPATA')
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { 
  fetchData().then(() => { lastIssueCount = activeIssues.value.length }) // Inizializza contatore
  pollingInterval = setInterval(fetchData, 2000) // Controllo ogni 2 sec
})
onUnmounted(() => clearInterval(pollingInterval))
</script>