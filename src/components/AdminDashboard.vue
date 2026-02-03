<template>
  <div class="min-h-screen bg-base-200">
    
    <div class="navbar bg-base-100 shadow-md px-4">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl font-black text-primary">HTLfix <span class="text-xs font-normal text-base-content ml-1">ADMIN</span></a>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost" @click="logout">Esci</button>
      </div>
    </div>

    <div class="p-4 max-w-5xl mx-auto">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Panoramica Hotel</h2>
        <button @click="fetchStats" class="btn btn-sm btn-ghost">Aggiorna Dati</button>
      </div>

      <div v-if="loading" class="text-center py-10">
        <span class="loading loading-spinner text-primary"></span>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <div class="stats shadow bg-white">
          <div class="stat">
            <div class="stat-figure text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="stat-title font-bold text-gray-500">Camere Sporche</div>
            <div class="stat-value text-error">{{ dirtyCount }}</div>
            <div class="stat-desc">Da pulire subito</div>
          </div>
        </div>
        
        <div class="stats shadow bg-white">
          <div class="stat">
            <div class="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div class="stat-title font-bold text-gray-500">Camere Pulite</div>
            <div class="stat-value text-success">{{ cleanCount }}</div>
            <div class="stat-desc">Pronte per check-in</div>
          </div>
        </div>

        <div class="stats shadow bg-white">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div class="stat-title font-bold text-gray-500">Totale Camere</div>
            <div class="stat-value text-primary">{{ totalCount }}</div>
            <div class="stat-desc">Hotel Capacity</div>
          </div>
        </div>

      </div>

      <div class="bg-base-100 rounded-box p-4 shadow-sm">
        <h3 class="font-bold mb-4">Stato Attuale Stanze</h3>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="room in rooms" :key="room.id" 
               class="p-2 text-center rounded text-white font-bold text-sm"
               :class="room.status === 'clean' ? 'bg-green-500' : 'bg-red-500'">
            {{ room.number }}
          </div>
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
const loading = ref(true)

// Calcoli automatici (Excel style)
const dirtyCount = computed(() => rooms.value.filter(r => r.status === 'dirty').length)
const cleanCount = computed(() => rooms.value.filter(r => r.status === 'clean').length)
const totalCount = computed(() => rooms.value.length)

const fetchStats = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('number')
  
  if (error) console.error(error)
  else rooms.value = data
  loading.value = false
}

const logout = () => {
  localStorage.removeItem('htlfix_user')
  router.push('/')
}

onMounted(() => {
  fetchStats()
})
</script>