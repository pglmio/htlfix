<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <div class="navbar bg-white shadow-md px-4 sticky top-0 z-50">
      <div class="flex-1 flex-col items-start">
        <span class="text-xl font-black text-blue-800 uppercase tracking-tighter">{{ hotelName }}</span>
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pannello Direttore</span>
      </div>
      <button class="btn btn-sm btn-ghost text-red-500" @click="logout">Esci</button>
    </div>

    <div class="p-4 max-w-5xl mx-auto">
      
      <div class="card bg-white shadow-sm mb-6 p-4">
        <h3 class="text-sm font-bold text-gray-500 uppercase mb-2">➕ Crea Nuova Stanza</h3>
        <div class="flex gap-2">
          <input v-model="newRoomNumber" type="text" placeholder="Es. 101" class="input input-bordered w-full" />
          <button @click="addRoom" class="btn btn-primary" :disabled="!newRoomNumber">Salva</button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 mb-6 text-center">
        <div class="bg-white p-3 rounded shadow border-t-4 border-red-500">
          <div class="text-2xl font-bold text-gray-800">{{ dirtyCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Sporche</div>
        </div>
        <div class="bg-white p-3 rounded shadow border-t-4 border-green-500">
          <div class="text-2xl font-bold text-gray-800">{{ cleanCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Pulite</div>
        </div>
        <div class="bg-white p-3 rounded shadow border-t-4 border-blue-500">
          <div class="text-2xl font-bold text-gray-800">{{ totalCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Totali</div>
        </div>
      </div>

      <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div v-for="room in rooms" :key="room.id" 
             class="p-3 rounded bg-white shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1" :class="room.status === 'clean' ? 'bg-green-500' : 'bg-red-500'"></div>
          <span class="font-bold text-gray-700 ml-2">{{ room.number }}</span>
          <button @click="deleteRoom(room.id)" class="btn btn-xs btn-square btn-ghost text-gray-300 hover:text-red-500">✕</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([])
const newRoomNumber = ref('')

// RECUPERO DATI DALLA MEMORIA LOCALE
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'MIO HOTEL'

// FILTRA SOLO LE STANZE DEL TUO HOTEL
const fetchStats = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (data) rooms.value = data
}

const addRoom = async () => {
  if (!newRoomNumber.value) return
  await supabase.from('rooms').insert([{ number: newRoomNumber.value, status: 'dirty', hotel_id: hotelId }])
  newRoomNumber.value = ''; fetchStats()
}

const deleteRoom = async (id) => {
  if(!confirm('Eliminare stanza?')) return
  await supabase.from('rooms').delete().eq('id', id)
  fetchStats()
}

const cleanCount = computed(() => rooms.value.filter(r => r.status === 'clean').length)
const dirtyCount = computed(() => rooms.value.filter(r => r.status === 'dirty').length)
const totalCount = computed(() => rooms.value.length)

const logout = () => { localStorage.clear(); router.push('/') }
onMounted(() => fetchStats())
</script>