<template>
  <div class="min-h-screen bg-pink-50 pb-20">
    <div class="navbar bg-pink-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">GOVERNANTE</span>
        <span class="text-[9px] bg-pink-900 px-2 rounded mt-1">Ciao, {{ myName }} 👋</span>
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
        <button @click="openCommandModal(room)" class="btn btn-sm btn-outline btn-secondary font-bold">⚡ GESTISCI</button>
      </div>
    </div>

    <dialog id="gov_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-1">Gestione Stanza {{ selectedRoom?.number }}</h3>
        
        <div class="flex flex-col gap-4 mt-4">
          <div class="bg-gray-50 p-3 rounded border border-gray-200">
             <h4 class="text-xs font-bold uppercase text-gray-500 mb-2">🧹 Assegna Pulizia</h4>
             <div class="flex gap-2">
               <select v-model="selectedCleaner" class="select select-sm select-bordered w-full">
                 <option disabled value="">Scegli Staff</option>
                 <option v-for="s in staff.cleaners" :key="s.id" :value="s.name">{{ s.name }}</option>
               </select>
               <button @click="assignTask('Pulizia Prioritaria', selectedCleaner)" class="btn btn-sm btn-error text-white" :disabled="!selectedCleaner">Vai</button>
             </div>
          </div>
          <div class="bg-gray-50 p-3 rounded border border-gray-200">
             <h4 class="text-xs font-bold uppercase text-gray-500 mb-2">🔧 Assegna Riparazione</h4>
             <select v-model="maintenanceType" class="select select-sm select-bordered w-full mb-2">
               <option>💡 Lampadina Rotta</option><option>📺 TV non va</option><option value="custom">Altro...</option>
             </select>
             <input v-if="maintenanceType === 'custom'" v-model="customIssueText" placeholder="Descrivi..." class="input input-sm input-bordered w-full mb-2"/>
             <div class="flex gap-2">
                <select v-model="selectedTech" class="select select-sm select-bordered w-full">
                  <option disabled value="">Scegli Tecnico</option>
                  <option v-for="m in staff.techs" :key="m.id" :value="m.name">{{ m.name }}</option>
                </select>
                <button @click="assignTask(maintenanceType==='custom'?customIssueText:maintenanceType, selectedTech)" class="btn btn-sm btn-warning" :disabled="!selectedTech">Invia</button>
             </div>
          </div>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full">Chiudi</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([]); const activeIssues = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'
const myName = localStorage.getItem('htlfix_user_name') || 'Gov'
const selectedRoom = ref(null); const selectedCleaner = ref(''); const selectedTech = ref('')
const maintenanceType = ref('💡 Lampadina Rotta'); const customIssueText = ref('')
const staff = reactive({ cleaners: [], techs: [] })
let pollingInterval = null

const fetchData = async () => {
  const { data: r } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (r && JSON.stringify(r) !== JSON.stringify(rooms.value)) rooms.value = r
  const { data: i } = await supabase.from('issues').select('room_number').eq('hotel_id', hotelId).eq('status', 'open')
  if (i) activeIssues.value = i.map(x => x.room_number)
}

const fetchStaffLists = async () => {
  const { data } = await supabase.from('staff_members').select('*').eq('hotel_id', hotelId)
  if (data) { staff.cleaners = data.filter(u => u.role === 'staff'); staff.techs = data.filter(u => u.role === 'maintenance') }
}

const assignTask = async (desc, who) => {
  await supabase.from('issues').insert([{ description: desc, room_number: selectedRoom.value.number, hotel_id: hotelId, status: 'open', assigned_to: who }])
  document.getElementById('gov_modal').close()
  alert(`Assegnato a ${who}!`)
  if(desc.includes('Pulizia')) await supabase.from('rooms').update({ status: 'dirty' }).eq('id', selectedRoom.value.id)
  fetchData(); selectedCleaner.value = ''; selectedTech.value = ''
}

const openCommandModal = (r) => { selectedRoom.value = r; document.getElementById('gov_modal').showModal() }
const hasIssue = (n) => activeIssues.value.includes(n)
const getStatusText = (s) => (s==='clean'?'LIBERA':s==='dirty'?'SPORCA':s==='cleaning'?'IN PULIZIA':'OCCUPATA')
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { fetchData(); fetchStaffLists(); pollingInterval = setInterval(fetchData, 1000) })
onUnmounted(() => clearInterval(pollingInterval))
</script>