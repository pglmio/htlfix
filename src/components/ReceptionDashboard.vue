<template>
  <div class="min-h-screen bg-purple-50 pb-20">
    <div class="navbar bg-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">RECEPTION</span>
      </div>
      <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow mr-4"></div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="room in rooms" :key="room.id" 
           class="card shadow-sm border p-3 text-center transition-all bg-white relative">
        
        <h2 class="text-2xl font-black text-gray-800 mb-2">{{ room.number }}</h2>

        <div class="badge w-full font-bold text-white mb-3 py-3 transition-colors duration-500"
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
            🧹 In attesa pulizia...
          </span>
        </div>
      </div>
    </div>
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
let pollingInterval = null

const fetchRooms = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  // Aggiorna solo se serve
  if (data && JSON.stringify(data) !== JSON.stringify(rooms.value)) {
    rooms.value = data
  }
}

const setStatus = async (room, status) => {
  room.status = status // Feedback immediato visivo
  await supabase.from('rooms').update({ status: status }).eq('id', room.id)
}

const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => {
  fetchRooms()
  // Aggiorna ogni 1 secondo (Super veloce)
  pollingInterval = setInterval(fetchRooms, 1000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>