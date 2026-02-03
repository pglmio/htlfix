<template>
  <div class="min-h-screen bg-purple-50 pb-20">
    <div class="navbar bg-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">RECEPTION</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="room in rooms" :key="room.id" 
           class="card shadow-sm border p-3 text-center transition-all bg-white relative">
        
        <h2 class="text-2xl font-black text-gray-800 mb-2">{{ room.number }}</h2>

        <div class="badge w-full font-bold text-white mb-3 py-3"
             :class="{
               'badge-success': room.status === 'clean',
               'badge-error': room.status === 'dirty',
               'badge-info': room.status === 'occupied'
             }">
          {{ room.status === 'clean' ? 'LIBERA' : (room.status === 'occupied' ? 'OCCUPATA' : 'SPORCA') }}
        </div>

        <div class="flex flex-col gap-1">
          
          <button v-if="room.status === 'clean'" @click="setStatus(room, 'occupied')" class="btn btn-xs btn-outline btn-info">
            👤 CHECK-IN
          </button>

          <button v-if="room.status === 'occupied'" @click="setStatus(room, 'dirty')" class="btn btn-xs btn-outline btn-error">
            🚪 CHECK-OUT
          </button>

          <span v-if="room.status === 'dirty'" class="text-[10px] text-gray-400 font-bold uppercase animate-pulse">
            🧹 In pulizia...
          </span>

        </div>
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

// CAMBIA LO STATO
const setStatus = async (room, status) => {
  // Aggiornamento visivo immediato
  room.status = status
  // Aggiornamento database
  await supabase.from('rooms').update({ status: status }).eq('id', room.id)
}

const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => {
  fetchRooms()
  // Ricarica ogni 3 secondi per vedere se le pulizie hanno finito
  setInterval(fetchRooms, 3000)
})
</script>