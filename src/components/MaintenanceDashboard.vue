<template>
  <div class="min-h-screen bg-orange-50 pb-20">
    <div class="navbar bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">MANUTENZIONE</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4">
      <h2 class="font-bold text-gray-500 mb-4 uppercase text-sm">Lista Guasti Attivi</h2>

      <div v-if="issues.length === 0" class="text-center opacity-40 mt-10">
        <div class="text-6xl mb-4">👍</div>
        <p>Nessun guasto da riparare.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="issue in issues" :key="issue.id" class="card bg-white shadow border-l-4 border-orange-500">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-2xl font-black text-gray-800">Stanza {{ issue.room_number }}</h3>
                <p class="text-lg font-bold text-orange-600">{{ issue.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(issue.created_at) }}</p>
              </div>
              <button @click="fixIssue(issue.id)" class="btn btn-success text-white btn-sm">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const issues = ref([])
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'

const fetchIssues = async () => {
  // Scarica solo i guasti 'open' (non ancora risolti)
  const { data } = await supabase
    .from('issues')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  
  if (data) issues.value = data
}

const fixIssue = async (id) => {
  if(!confirm('Hai riparato il guasto?')) return
  
  // Segna come 'fixed' nel database
  await supabase.from('issues').update({ status: 'fixed' }).eq('id', id)
  
  // Rimuovi dalla lista visiva
  fetchIssues()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const logout = () => { localStorage.clear(); router.push('/') }

// Controlla nuovi guasti ogni 5 secondi
onMounted(() => {
  fetchIssues()
  setInterval(fetchIssues, 5000)
})
</script>