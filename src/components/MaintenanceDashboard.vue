<template>
  <div class="min-h-screen bg-orange-50 pb-20">
    <div v-if="showToast" class="toast toast-top toast-center z-50">
      <div class="alert alert-info shadow-xl border-2 border-white">
        <span class="text-white font-bold text-lg">🔧 Nuovo lavoro per te!</span>
      </div>
    </div>

    <div class="navbar bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">MANUTENZIONE</span>
        <span class="text-[9px] bg-orange-800 px-2 rounded mt-1">Ciao, {{ myName }}! 🔧</span>
      </div>
      <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow mr-4"></div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4">
      <h2 class="font-bold text-gray-500 mb-4 uppercase text-sm flex justify-between items-center">
        Ticket Aperti <span class="badge badge-neutral text-xs">Live</span>
      </h2>

      <div v-if="issues.length === 0" class="text-center opacity-40 mt-10">
        <div class="text-6xl mb-4 grayscale">👍</div><p class="font-bold">Tutto funziona correttamente.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="issue in issues" :key="issue.id" 
             class="card bg-white shadow-lg border-l-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
             :class="isAssignedToMe(issue.assigned_to) ? 'border-blue-600 ring-2 ring-blue-100' : 'border-orange-500'">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-2xl font-black text-gray-800">Stanza {{ issue.room_number }}</h3>
                  <span v-if="isAssignedToMe(issue.assigned_to)" class="badge badge-primary text-xs font-bold animate-pulse">PER TE 👤</span>
                  <span v-else-if="issue.assigned_to" class="badge badge-ghost text-xs font-bold text-gray-400">Per {{ issue.assigned_to }}</span>
                  <span v-else class="badge badge-warning text-xs font-bold">GENERICO</span>
                </div>
                <p class="text-lg font-bold text-orange-600">{{ issue.description }}</p>
                <p class="text-xs text-gray-400 mt-2">🕒 {{ formatDate(issue.created_at) }}</p>
              </div>
              <button @click="fixIssue(issue.id)" class="btn btn-success text-white btn-sm shadow-md">Risolto ✅</button>
            </div>
          </div>
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
const issues = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'
const myName = localStorage.getItem('htlfix_user_name') || 'Tecnico'
const showToast = ref(false)
let lastCount = 0
let pollingInterval = null

// SUONO
const playSound = () => {
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  audio.play().catch(e => {})
}

const fetchIssues = async () => {
  const { data } = await supabase.from('issues').select('*').eq('hotel_id', hotelId).eq('status', 'open').order('created_at', { ascending: false })
  
  if (data) {
    // Se c'è un NUOVO ticket rispetto a prima -> NOTIFICA
    if (data.length > lastCount && lastCount !== 0) {
      showToast.value = true
      playSound()
      setTimeout(() => showToast.value = false, 4000)
    }
    
    // Controlla solo se le liste sono diverse per evitare refresh visivi inutili
    if (JSON.stringify(data) !== JSON.stringify(issues.value)) {
      issues.value = data
    }
    lastCount = data.length
  }
}

const isAssignedToMe = (assignedName) => assignedName === myName
const fixIssue = async (id) => { if(!confirm('Confermi riparazione?')) return; await supabase.from('issues').update({ status: 'fixed' }).eq('id', id); fetchIssues() }
const formatDate = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { 
  fetchIssues().then(() => { lastCount = issues.value.length })
  pollingInterval = setInterval(fetchIssues, 2000) 
})
onUnmounted(() => clearInterval(pollingInterval))
</script>