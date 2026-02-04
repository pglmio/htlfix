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
        <span class="text-[10px] bg-pink-800 px-2 py-1 rounded text-white mt-1">Capo Servizio 🗝️</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="room in rooms" :key="room.id" class="card shadow-sm border p-3 text-center transition-all bg-white relative">
        <div class="badge w-full font-bold text-white mb-2 py-3 uppercase text-xs" 
             :class="{'badge-success': room.status==='clean','badge-error': room.status==='dirty','badge-warning': room.status==='cleaning','badge-info': room.status==='occupied'}">
          {{ getStatusText(room.status) }}
        </div>
        
        <h2 class="text-3xl font-black text-gray-800 mb-1">{{ room.number }}</h2>
        
        <p v-if="room.current_cleaner" class="text-xs text-pink-600 font-bold mb-2 animate-pulse">
          🧹 {{ room.current_cleaner }}
        </p>
        <p v-else class="text-xs text-gray-300 mb-2">-</p>

        <button @click="openManageModal(room)" class="btn btn-sm btn-outline btn-secondary w-full">GESTISCI</button>
      </div>
    </div>

    <dialog id="gov_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4">Gestione Stanza {{ selectedRoom?.number }}</h3>
        
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-2">
             <button @click="setStatus('dirty')" class="btn btn-error text-white btn-sm">DA PULIRE</button>
             <button @click="setStatus('clean')" class="btn btn-success text-white btn-sm">PULITA</button>
          </div>

          <div class="divider my-0">ASSEGNA PULIZIA</div>

          <div class="form-control w-full">
            <label class="label"><span class="label-text font-bold">Scegli Cameriera/e:</span></label>
            <select v-model="selectedCleaner" class="select select-bordered w-full bg-gray-50">
              <option disabled selected value="">-- Seleziona Staff --</option>
              <option v-for="staff in cleanersList" :key="staff.id" :value="staff.name">
                {{ staff.name }}
              </option>
            </select>
          </div>
          
          <button @click="assignCleaner" class="btn btn-primary w-full shadow-lg" :disabled="!selectedCleaner">
            ASSEGNA ORA 🚀
          </button>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full">Chiudi</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([])
const cleanersList = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name')
const selectedRoom = ref(null)
const selectedCleaner = ref('')
const audioEnabled = ref(false)

const playSound = () => {
  if(!audioEnabled.value) return
  const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3')
  audio.play().catch(e => {})
}
const enableAudio = () => { audioEnabled.value = true; playSound() }

const fetchRooms = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  rooms.value = data
}

const fetchCleaners = async () => {
  const { data } = await supabase.from('staff_members').select('id, name').eq('hotel_id', hotelId).eq('role', 'staff')
  cleanersList.value = data || []
}

const setStatus = async (status) => {
  await supabase.from('rooms').update({ status: status }).eq('id', selectedRoom.value.id)
  document.getElementById('gov_modal').close()
  fetchRooms()
}

const assignCleaner = async () => {
  if (!selectedCleaner.value) return
  await supabase.from('rooms').update({ status: 'dirty', current_cleaner: selectedCleaner.value }).eq('id', selectedRoom.value.id)
  document.getElementById('gov_modal').close()
  fetchRooms()
  alert(`Assegnato a ${selectedCleaner.value}! Il suo telefono suonerà.`)
}

const openManageModal = (room) => {
  selectedRoom.value = room
  selectedCleaner.value = ''
  document.getElementById('gov_modal').showModal()
}

const getStatusText = (s) => (s==='clean'?'PULITA':s==='dirty'?'DA PULIRE':s==='cleaning'?'IN PULIZIA':'OCCUPATA')
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => {
  fetchRooms()
  fetchCleaners()
  setInterval(fetchRooms, 2000)
})
</script>