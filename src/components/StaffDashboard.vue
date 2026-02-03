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
           :class="room.status === 'clean' ? 'border-green-400 opacity-60' : 'border-red-500'">
        
        <div class="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <h2 class="text-3xl font-black text-gray-800">{{ room.number }}</h2>
            <span class="font-bold text-[10px] uppercase tracking-wider" 
               :class="room.status === 'clean' ? 'text-green-600' : 'text-red-600'">
              {{ room.status === 'clean' ? 'PULITA' : 'DA PULIRE' }}
            </span>
          </div>
          <button @click="toggleStatus(room)" class="btn btn-circle w-14 h-14 border-none shadow-sm"
            :class="room.status === 'clean' ? 'bg-gray-100 text-gray-400' : 'bg-green-500 text-white animate-pulse'">
            ✓
          </button>
        </div>
      </div>
      
      <div v-if="rooms.length === 0" class="text-center mt-10 text-gray-400">
        Nessuna stanza assegnata.
      </div>
    </div>
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

const fetchRooms = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (data) rooms.value = data
}

const toggleStatus = async (room) => {
  const newStatus = room.status === 'dirty' ? 'clean' : 'dirty'
  room.status = newStatus // Aggiorna subito visivamente
  await supabase.from('rooms').update({ status: newStatus }).eq('id', room.id)
}

const logout = () => { localStorage.clear(); router.push('/') }
onMounted(() => fetchRooms())
</script>