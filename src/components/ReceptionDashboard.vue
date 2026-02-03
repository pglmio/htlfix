<template>
  <div class="min-h-screen bg-purple-50 pb-20">
    <div class="navbar bg-purple-700 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">RECEPTION</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4">
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div v-for="room in rooms" :key="room.id" 
             class="card shadow-sm border p-3 text-center transition-all"
             :class="room.status === 'clean' ? 'bg-white border-green-500' : 'bg-gray-200 border-red-300 opacity-80'">
          
          <h2 class="text-xl font-black text-gray-800">{{ room.number }}</h2>
          <div class="badge badge-xs font-bold text-white mt-1 py-2 w-full" 
               :class="room.status === 'clean' ? 'badge-success' : 'badge-error'">
            {{ room.status === 'clean' ? 'PRONTA' : 'SPORCA' }}
          </div>
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
  // Polling: ricarica ogni 5 secondi per vedere se le cameriere aggiornano
  setInterval(async () => {
    const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
    if (data) rooms.value = data
  }, 5000)

  // Primo caricamento
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (data) rooms.value = data
}

const logout = () => { localStorage.clear(); router.push('/') }
onMounted(() => fetchRooms())
</script>