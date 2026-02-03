<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="navbar bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">HOUSEKEEPING</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 space-y-3">
      <div v-for="room in rooms" :key="room.id" 
           class="card bg-white shadow-md border-l-8"
           :class="{
             'border-green-400 opacity-60': room.status === 'clean',
             'border-red-500': room.status === 'dirty',
             'border-blue-500 opacity-40': room.status === 'occupied'
           }">
        
        <div class="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <h2 class="text-3xl font-black text-gray-800">{{ room.number }}</h2>
            <span class="font-bold text-[10px] uppercase tracking-wider" 
               :class="{
                 'text-green-600': room.status === 'clean',
                 'text-red-600': room.status === 'dirty',
                 'text-blue-600': room.status === 'occupied'
               }">
               {{ room.status === 'clean' ? 'PULITA' : (room.status === 'occupied' ? 'OCCUPATA' : 'DA PULIRE') }}
            </span>
          </div>
          
          <div class="flex gap-2">
            <button @click="openIssueModal(room)" class="btn btn-circle btn-warning text-white btn-sm shadow-sm">⚠️</button>

            <button v-if="room.status === 'dirty'" @click="cleanRoom(room)" class="btn btn-circle w-14 h-14 bg-red-500 text-white shadow-sm animate-pulse border-none">
              🧹
            </button>
            <div v-else-if="room.status === 'clean'" class="btn btn-circle w-14 h-14 bg-gray-100 text-gray-300 border-none cursor-default">✓</div>
            <div v-else-if="room.status === 'occupied'" class="btn btn-circle w-14 h-14 bg-blue-50 text-blue-200 border-none cursor-default">🚫</div>
          </div>
        </div>
      </div>
    </div>

    <dialog id="issue_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4">⚠️ Segnala Guasto Stanza {{ selectedRoom?.number }}</h3>
        
        <div class="flex flex-col gap-3">
          <button @click="reportIssue('💡 Lampadina Rotta')" class="btn btn-outline w-full justify-start pl-6">
            💡 Lampadina Rotta
          </button>
          <button @click="reportIssue('📺 TV non funziona')" class="btn btn-outline w-full justify-start pl-6">
            📺 TV non va
          </button>
          <button @click="reportIssue('🚽 Bagno intasato')" class="btn btn-outline w-full justify-start pl-6">
            🚽 Bagno intasato
          </button>
          <button @click="reportIssue('❄️ Aria condizionata')" class="btn btn-outline w-full justify-start pl-6">
            ❄️ Aria Condizionata
          </button>

          <div class="divider text-xs">OPPURE SCRIVI TU</div>

          <div class="flex gap-2">
            <input v-model="customIssue" type="text" placeholder="Es. Manca telecomando..." class="input input-bordered w-full" />
            <button @click="reportIssue(customIssue)" class="btn btn-warning text-white" :disabled="!customIssue">
              INVIA
            </button>
          </div>
        </div>

        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-ghost w-full">Chiudi senza inviare</button>
          </form>
        </div>
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
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'
const selectedRoom = ref(null)
const customIssue = ref('')

const fetchRooms = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (data) rooms.value = data
}

const cleanRoom = async (room) => {
  room.status = 'clean'
  await supabase.from('rooms').update({ status: 'clean' }).eq('id', room.id)
}

// APRE IL MODALE
const openIssueModal = (room) => { 
  selectedRoom.value = room
  customIssue.value = '' // Pulisce il testo vecchio
  document.getElementById('issue_modal').showModal() 
}

// INVIA LA SEGNALAZIONE
const reportIssue = async (desc) => {
  if (!desc) return // Se è vuoto non fare nulla

  // 1. Invia a Supabase
  await supabase.from('issues').insert([{ 
    description: desc, 
    room_number: selectedRoom.value.number, 
    hotel_id: hotelId, 
    status: 'open' 
  }])

  // 2. Chiudi modale e avvisa
  document.getElementById('issue_modal').close()
  alert(`✅ Segnalazione inviata: "${desc}"`)
}

const logout = () => { localStorage.clear(); router.push('/') }
onMounted(() => fetchRooms())
</script>