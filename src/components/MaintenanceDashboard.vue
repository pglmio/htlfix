<template>
  <div class="min-h-screen bg-orange-50 pb-20">
    <div class="navbar bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">MANUTENZIONE</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
        <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
      </div>
    </div>

    <div class="p-4">
      <h2 class="font-bold text-gray-500 mb-4 uppercase text-sm flex justify-between items-center">
        Guasti Attivi
        <span class="badge badge-neutral text-xs">Aggiornamento live</span>
      </h2>

      <div v-if="issues.length === 0" class="text-center opacity-40 mt-10 flex flex-col items-center">
        <div class="text-6xl mb-4 grayscale">👍</div>
        <p class="font-bold">Tutto funziona correttamente.</p>
        <p class="text-xs mt-2">Nessuna segnalazione in attesa.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="issue in issues" :key="issue.id" class="card bg-white shadow-lg border-l-4 border-orange-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-2xl font-black text-gray-800 flex items-center gap-2">
                  Stanza {{ issue.room_number }}
                  <span class="badge badge-warning text-xs animate-pulse">NUOVO</span>
                </h3>
                <p class="text-lg font-bold text-orange-600 mt-1">{{ issue.description }}</p>
                <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  🕒 {{ formatDate(issue.created_at) }}
                </p>
              </div>
              <button @click="fixIssue(issue.id)" class="btn btn-success text-white btn-sm shadow-md">
                Risolto ✅
              </button>
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
let pollingInterval = null

// SCARICA I GUASTI
const fetchIssues = async () => {
  const { data } = await supabase
    .from('issues')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  
  // Aggiorniamo solo se i dati sono cambiati per evitare sfarfallii inutili
  if (data && JSON.stringify(data) !== JSON.stringify(issues.value)) {
    issues.value = data
  }
}

// RIPARA
const fixIssue = async (id) => {
  if(!confirm('Hai riparato il guasto?')) return
  await supabase.from('issues').update({ status: 'fixed' }).eq('id', id)
  fetchIssues() // Aggiorna subito
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => {
  fetchIssues()
  // IL CUORE PULSANTE: Controlla ogni 1000ms (1 secondo)
  pollingInterval = setInterval(fetchIssues, 1000)
})

onUnmounted(() => {
  // Spegne il controllo quando chiudi la pagina per non consumare batteria
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>