<template>
  <div class="min-h-screen bg-pink-50 pb-20 relative">

    <div v-if="!audioEnabled" class="fixed inset-0 z-[999] bg-pink-600/95 flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm">
      <div class="text-6xl mb-6 animate-pulse">🗝️</div>
      <h2 class="text-3xl font-black mb-2">GOVERNANTE</h2>
      <p class="mb-8 font-bold opacity-80 max-w-xs mx-auto">Clicca per gestire lo staff e le stanze.</p>
      <button @click="enableAudio" class="btn btn-white text-pink-600 font-black btn-lg shadow-xl hover:scale-105 transition-transform">
        INIZIA TURNO
      </button>
    </div>

    <div class="navbar bg-pink-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">GOVERNANTE</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="room in rooms" :key="room.id" class="card shadow-sm border p-3 text-center transition-all bg-white relative overflow-visible">
        
        <div v-if="hasIssue(room.number)" class="absolute -top-2 -right-2 bg-orange-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md font-bold text-lg animate-bounce z-10 border-2 border-white" title="Guasto in corso">
          🔧
        </div>

        <div class="badge w-full font-bold text-white mb-2 py-3 uppercase text-xs" 
             :class="{'badge-success': room.status==='clean','badge-error': room.status==='dirty','badge-warning': room.status==='cleaning','badge-info': room.status==='occupied'}">
          {{ getStatusText(room.status) }}
        </div>
        
        <h2 class="text-3xl font-black text-gray-800 mb-1">{{ room.number }}</h2>
        
        <p v-if="room.current_cleaner" class="text-xs text-pink-600 font-bold mb-2 truncate">🧹 {{ room.current_cleaner }}</p>
        <p v-else class="text-xs text-gray-300 mb-2">-</p>

        <button @click="openManageModal(room)" class="btn btn-sm btn-outline btn-secondary w-full">GESTISCI</button>
      </div>
    </div>

    <dialog id="gov_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4 uppercase">Stanza {{ selectedRoom?.number }}</h3>
        
        <div class="flex flex-col gap-4">
          <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 class="text-xs font-black text-blue-800 uppercase mb-3">🧹 Assegna Pulizia</h4>
            <div class="flex gap-2">
              <select v-model="selectedCleaner" class="select select-bordered select-sm flex-1 bg-white">
                <option disabled value="">Staff Pulizie...</option>
                <option v-for="c in cleanersList" :key="c.id" :value="c.name">{{ c.name }}</option>
              </select>
              <button @click="assignCleaner" class="btn btn-primary btn-sm" :disabled="!selectedCleaner">OK</button>
            </div>
          </div>

          <div class="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h4 class="text-xs font-black text-orange-800 uppercase mb-3">🔧 Assegna Guasto</h4>
            
            <div v-if="hasIssue(selectedRoom?.number)" class="alert alert-warning py-2 mb-2 text-xs font-bold shadow-sm">
              <span>⚠️ C'è già un ticket aperto per questa stanza!</span>
            </div>

            <input v-model="issueDesc" type="text" placeholder="Descrivi il problema..." class="input input-bordered input-sm w-full mb-2 bg-white" />
            <div class="flex gap-2">
              <select v-model="selectedTech" class="select select-bordered select-sm flex-1 bg-white">
                <option disabled value="">Manutentore...</option>
                <option v-for="t in techList" :key="t.id" :value="t.name">{{ t.name }}</option>
              </select>
              <button @click="assignTechIssue" class="btn btn-warning btn-sm text-white" :disabled="!selectedTech || !issueDesc">INVIA 🔧</button>
            </div>
          </div>

          <div class="divider">STATO RAPIDO</div>
          <div class="grid grid-cols-2 gap-2">
             <button @click="setStatus('dirty')" class="btn btn-error btn-outline btn-sm">DIRTY</button>
             <button @click="setStatus('clean')" class="btn btn-success btn-outline btn-sm">CLEAN</button>
          </div>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full uppercase font-bold text-xs">Chiudi</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([]); const cleanersList = ref([]); const techList = ref([])
const activeIssues = ref([]) // QUI SALVIAMO I NUMERI DELLE STANZE CON GUASTI
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name')
const selectedRoom = ref(null); const selectedCleaner = ref(''); const selectedTech = ref(''); const issueDesc = ref('')
const audioEnabled = ref(false)

const playPop = () => { new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg').play().catch(e => {}) }
const enableAudio = () => { audioEnabled.value = true; playPop() }

const fetchData = async () => {
  // 1. Scarica Stanze
  const { data: r } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  rooms.value = r || []

  // 2. Scarica Staff
  const { data: s } = await supabase.from('staff_members').select('*').eq('hotel_id', hotelId)
  cleanersList.value = s?.filter(m => m.role === 'staff') || []
  techList.value = s?.filter(m => m.role === 'maintenance') || []

  // 3. Scarica GUASTI ATTIVI (Solo quelli 'open')
  const { data: i } = await supabase.from('issues').select('room_number').eq('hotel_id', hotelId).eq('status', 'open')
  if (i) {
    activeIssues.value = i.map(ticket => ticket.room_number)
  }
}

// Funzione per controllare se la stanza ha un problema
const hasIssue = (roomNumber) => activeIssues.value.includes(roomNumber)

const assignCleaner = async () => {
  await supabase.from('rooms').update({ status: 'dirty', current_cleaner: selectedCleaner.value }).eq('id', selectedRoom.value.id)
  document.getElementById('gov_modal').close(); fetchData()
}

const assignTechIssue = async () => {
  await supabase.from('issues').insert([{ 
    description: issueDesc.value, 
    room_number: selectedRoom.value.number, 
    hotel_id: hotelId, 
    status: 'open',
    assigned_to: selectedTech.value 
  }])
  alert('Guasto inviato a ' + selectedTech.value + '! Apparirà il bollino 🔧'); 
  issueDesc.value = ''; 
  document.getElementById('gov_modal').close()
  fetchData() // Aggiorna subito per far apparire il bollino
}

const setStatus = async (s) => { await supabase.from('rooms').update({ status: s }).eq('id', selectedRoom.value.id); document.getElementById('gov_modal').close(); fetchData() }
const openManageModal = (r) => { selectedRoom.value = r; selectedCleaner.value = ''; selectedTech.value = ''; issueDesc.value = ''; document.getElementById('gov_modal').showModal() }
const getStatusText = (s) => (s==='clean'?'PULITA':s==='dirty'?'SPORCA':s==='cleaning'?'PULIZIA':'OCCUPATA')
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { fetchData(); setInterval(fetchData, 3000) })
</script>