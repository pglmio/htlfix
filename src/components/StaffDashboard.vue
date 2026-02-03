<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    
    <div class="navbar bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1">
        <span class="font-bold text-xl ml-2">Housekeeping</span>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost text-white" @click="logout">
          Esci
        </button>
      </div>
    </div>

    <div class="p-4 space-y-4">
      
      <div v-if="loading" class="text-center mt-10">
        <span class="loading loading-spinner loading-lg text-blue-600"></span>
      </div>

      <div v-else v-for="room in rooms" :key="room.id" 
           class="card bg-white shadow-md border-l-8 overflow-hidden"
           :class="room.status === 'clean' ? 'border-green-500 opacity-60' : 'border-red-500'">
        
        <div class="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <h2 class="text-3xl font-black text-gray-800">{{ room.number }}</h2>
            <span class="font-bold text-sm uppercase" 
               :class="room.status === 'clean' ? 'text-green-600' : 'text-red-600'">
              {{ room.status === 'clean' ? 'PULITA' : 'DA PULIRE' }}
            </span>
          </div>

          <button 
            @click="toggleStatus(room)"
            class="btn btn-circle w-16 h-16 border-none shadow-sm"
            :class="room.status === 'clean' ? 'bg-gray-200 text-gray-400' : 'bg-green-500 text-white'">
            
            <svg v-if="room.status === 'dirty'" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
const loading = ref(true)

const fetchRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('number')
  
  if (rooms.value) rooms.value = data
  loading.value = false
}

const toggleStatus = async (room) => {
  // Cambio rapido visivo
  const newStatus = room.status === 'dirty' ? 'clean' : 'dirty'
  room.status = newStatus
  
  // Aggiorno database
  await supabase
    .from('rooms')
    .update({ status: newStatus })
    .eq('id', room.id)
}

const logout = () => {
  localStorage.removeItem('htlfix_user')
  router.push('/')
}

onMounted(() => {
  fetchRooms()
})
</script>