<template>
  <div class="min-h-screen bg-orange-50 pb-20 relative">
    
    <div v-if="!audioEnabled" class="fixed inset-0 z-[999] bg-orange-600/90 flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm">
      <div class="text-6xl mb-4">🔧</div>
      <h2 class="text-3xl font-black mb-2">MANUTENZIONE</h2>
      <p class="mb-8 font-bold opacity-80">Clicca per attivare le notifiche.</p>
      <button @click="enableAudio" class="btn btn-white text-orange-600 font-black btn-lg shadow-xl animate-bounce">
        INIZIA TURNO
      </button>
    </div>

    <div v-if="showToast" class="toast toast-top toast-center z-50">
      <div class="alert alert-info shadow-xl border-4 border-white animate-bounce">
        <span class="text-white font-black text-2xl">🚨 GUASTO!</span>
      </div>
    </div>

    <div class="navbar bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">MANUTENZIONE</span>
        <span class="text-[9px] bg-orange-800 px-2 rounded mt-1">Tecnico: {{ myName }}</span>
      </div>
      <div class="mr-4 text-xs font-bold opacity-80">
        {{ audioEnabled ? '🔊 ON' : '🔇 OFF' }}
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4">
      <h2 class="font-bold text-gray-500 mb-4 uppercase text-sm flex justify-between items-center">
        Ticket Aperti <span class="badge badge-neutral text-xs animate-pulse">LIVE</span>
      </h2>

      <div v-if="issues.length === 0" class="text-center opacity-40 mt-10">
        <div class="text-6xl mb-4 grayscale">👍</div><p class="font-bold">Nessun guasto attivo.</p>
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
const audioEnabled = ref(false)
const lastCount = ref(-1) 
let pollingInterval = null

const playStartSound = () => {
  const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg')
  audio.volume = 0.5
  audio.play().catch(e => {})
}

const playNotifySound = () => {
  if (!audioEnabled.value) return
  // BIP CORTO
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
  audio.play().catch(e => {})
}

const enableAudio = () => { audioEnabled.value = true; playStartSound() }

const fetchIssues = async () => {
  const { data } = await supabase.from('issues').select('*').eq('hotel_id', hotelId).eq('status', 'open').order('created_at', { ascending: false })
  
  if (data) {
    const currentQty = data.length
    if (lastCount.value !== -1 && currentQty > lastCount.value) {
      showToast.value = true
      playNotifySound() // SUONA IL BIP
      setTimeout(() => showToast.value = false, 4000)
    }
    if (JSON.stringify(data) !== JSON.stringify(issues.value)) issues.value = data
    lastCount.value = currentQty
  }
}

const isAssignedToMe = (assignedName) => assignedName === myName
const fixIssue = async (id) => { if(!confirm('Confermi riparazione?')) return; await supabase.from('issues').update({ status: 'fixed' }).eq('id', id); fetchIssues() }
const formatDate = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { 
  fetchIssues()
  pollingInterval = setInterval(fetchIssues, 2000) 
})
onUnmounted(() => clearInterval(pollingInterval))
</script>