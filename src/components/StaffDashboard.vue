<template>
  <div class="min-h-screen bg-slate-50 pb-20 relative">
    
    <div v-if="!audioEnabled" class="fixed inset-0 z-[999] bg-[#707eff]/95 flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm">
      <div class="text-6xl mb-6 animate-pulse">🧹</div>
      <h2 class="text-3xl font-black mb-2">HOUSEKEEPING</h2>
      <p class="mb-8 font-bold opacity-80 max-w-xs mx-auto">Ciao {{ currentCleanerName }}! Inizia il turno.</p>
      
      <button @click="enableAudio" class="btn btn-white text-[#707eff] font-black btn-lg shadow-xl hover:scale-105 transition-transform">
        INIZIA TURNO
      </button>
    </div>

    <div v-if="showToast" class="toast toast-top toast-center z-50">
      <div class="alert alert-error shadow-xl border-4 border-white animate-bounce">
        <span class="text-white font-bold text-lg">🧹 Nuova stanza da pulire!</span>
      </div>
    </div>

    <div class="navbar bg-[#707eff] text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">HOUSEKEEPING</span>
        <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white mt-1 font-bold">Ciao, {{ currentCleanerName }}! 👋</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 space-y-3">
      <div v-for="room in rooms" :key="room.id" class="card bg-white shadow-md border-l-8 transition-all" 
           :class="{
             'border-green-500 opacity-60': room.status === 'clean', 
             'border-red-500': room.status === 'dirty', 
             'border-yellow-400': room.status === 'cleaning', 
             'border-blue-500 opacity-40': room.status === 'occupied'
           }">
        
        <div class="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <h2 class="text-3xl font-black text-gray-800">{{ room.number }}</h2>
            <span class="font-bold text-[10px] uppercase tracking-wider" 
                  :class="{
                    'text-green-600': room.status === 'clean',
                    'text-red-600': room.status === 'dirty',
                    'text-yellow-600': room.status === 'cleaning',
                    'text-blue-600': room.status === 'occupied'
                  }">
               {{ getStatusText(room.status) }}
            </span>
          </div>
          
          <div class="flex gap-2 items-center">
            <button @click="openIssueModal(room)" class="btn btn-circle btn-warning text-white btn-sm shadow-sm">⚠️</button>
            
            <button v-if="room.status === 'dirty'" @click="startCleaning(room)" class="btn w-24 bg-red-500 hover:bg-red-600 text-white border-none shadow-md font-bold">INIZIA</button>
            <button v-else-if="room.status === 'cleaning'" @click="finishCleaning(room)" class="btn w-24 bg-yellow-400 hover:bg-yellow-500 text-black border-none shadow-md font-bold animate-pulse">FINITO</button>
            <div v-else-if="room.status === 'clean'" class="btn btn-circle bg-gray-100 text-gray-300 border-none cursor-default">✓</div>
            <div v-else-if="room.status === 'occupied'" class="btn btn-circle bg-blue-50 text-blue-200 border-none cursor-default">🚫</div>
          </div>
        </div>
      </div>
    </div>

    <dialog id="staff_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4 text-slate-800 uppercase">⚠️ Guasto Stanza {{ selectedRoom?.number }}</h3>
        
        <div class="flex flex-col gap-3">
          <button @click="reportIssue('💡 Lampadina Rotta')" class="btn btn-outline w-full justify-start pl-6 normal-case font-bold text-slate-600 border-slate-300">💡 Lampadina Rotta</button>
          
          <div class="flex gap-2">
            <input v-model="customIssue" type="text" placeholder="Descrivi il problema..." class="input input-bordered w-full bg-slate-50" />
            <button @click="reportIssue(customIssue)" class="btn btn-warning text-white font-bold">INVIA</button>
          </div>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full text-slate-400">Chiudi</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'
const currentCleanerName = localStorage.getItem('htlfix_user_name') || 'Staff'
const selectedRoom = ref(null); const customIssue = ref('')
const showToast = ref(false)
const audioEnabled = ref(false)
const lastDirtyCount = ref(-1)
let pollingInterval = null

// --- SUONI ---
const playStartSound = () => {
  const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg')
  audio.volume = 0.5
  audio.play().catch(e => {})
}

const playNotifySound = () => {
  if(!audioEnabled.value) return
  // BIP CORTO
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  audio.play().catch(e => {})
}

const enableAudio = () => { audioEnabled.value = true; playStartSound() }

const fetchRooms = async () => { 
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
   
  if (data) {
    const currentDirty = data.filter(r => r.status === 'dirty').length
    if (lastDirtyCount.value !== -1 && currentDirty > lastDirtyCount.value) {
      showToast.value = true
      playNotifySound() // SUONA
      setTimeout(() => showToast.value = false, 4000)
    }
    if (JSON.stringify(data) !== JSON.stringify(rooms.value)) rooms.value = data
    lastDirtyCount.value = currentDirty
  }
}

const startCleaning = async (r) => { r.status='cleaning'; await supabase.from('rooms').update({ status: 'cleaning', current_cleaner: currentCleanerName }).eq('id', r.id) }
const finishCleaning = async (r) => { r.status='clean'; await supabase.from('rooms').update({ status: 'clean' }).eq('id', r.id) }
const getStatusText = (s) => (s==='clean'?'PULITA':s==='dirty'?'DA PULIRE':s==='cleaning'?'IN PULIZIA':'OCCUPATA')
const reportIssue = async (desc) => { if(!desc) return; await supabase.from('issues').insert([{ description: desc, room_number: selectedRoom.value.number, hotel_id: hotelId, status: 'open' }]); document.getElementById('staff_modal').close(); alert('Inviato!') }
const openIssueModal = (r) => { selectedRoom.value = r; customIssue.value = ''; document.getElementById('staff_modal').showModal() }
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { 
  fetchRooms()
  pollingInterval = setInterval(fetchRooms, 2000) 
})
onUnmounted(() => clearInterval(pollingInterval))
</script>