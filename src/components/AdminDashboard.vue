<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <div class="navbar bg-[#707eff] text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl text-white">ADMIN PANEL</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-4 max-w-5xl mx-auto space-y-6">
      
      <section class="card bg-white shadow-xl border">
        <div class="card-body p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Gestione Staff</h2>
            <button @click="openStaffModal" class="btn btn-primary btn-sm">+ AGGIUNGI</button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full text-xs md:text-sm">
              <thead>
                <tr class="bg-slate-100 uppercase text-slate-500">
                  <th>Nome</th>
                  <th>Ruolo</th>
                  <th>PIN</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in staffList" :key="member.id">
                  <td class="font-bold">{{ member.name }}</td>
                  <td>
                    <span class="badge badge-sm font-bold uppercase" :class="getRoleClass(member.role)">{{ member.role }}</span>
                  </td>
                  <td class="font-mono text-lg font-bold text-blue-600 tracking-widest">{{ member.pin }}</td>
                  <td>
                    <button @click="deleteStaff(member.id)" class="btn btn-ghost btn-xs text-error">Elimina</button>
                  </td>
                </tr>
                <tr v-if="staffList.length === 0">
                    <td colspan="4" class="text-center text-gray-400 py-4">Nessun membro dello staff. Aggiungine uno!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="card bg-white shadow-xl border">
        <div class="card-body p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Stanze Hotel</h2>
            <button @click="addRoom" class="btn btn-outline btn-sm">+ AGGIUNGI STANZA</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="room in rooms" :key="room.id" class="badge badge-lg py-4 px-6 border bg-slate-50 font-black relative group">
              {{ room.number }}
              <button @click="deleteRoom(room.id)" class="ml-3 text-red-300 hover:text-red-600 transition-colors font-bold">×</button>
            </div>
             <div v-if="rooms.length === 0" class="w-full text-center text-gray-400 italic">
                Nessuna stanza creata.
            </div>
          </div>
        </div>
      </section>

    </div>

    <dialog id="staff_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box bg-white">
        <h3 class="font-bold text-lg text-center mb-4 uppercase">Nuovo Membro Staff</h3>
        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold uppercase">Nome Completo</span></label>
            <input v-model="newStaff.name" type="text" placeholder="Es. Maria Rossi" class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold uppercase">Ruolo</span></label>
            <select v-model="newStaff.role" class="select select-bordered w-full">
              <option value="staff">Housekeeping (Cameriera)</option>
              <option value="maintenance">Manutenzione (Tecnico)</option>
              <option value="governante">Governante</option>
              <option value="reception">Receptionist</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold uppercase">PIN Accesso (4 cifre)</span></label>
            <input v-model="newStaff.pin" type="text" maxlength="4" inputmode="numeric" placeholder="Es. 1234" class="input input-bordered w-full font-mono text-2xl text-center" />
          </div>
          <button @click="saveStaff" class="btn btn-primary w-full mt-4 shadow-lg">SALVA STAFF 💾</button>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn btn-ghost w-full">Annulla</button></form></div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'Hotel' // Fallback se manca il nome
const staffList = ref([])
const rooms = ref([])
const newStaff = ref({ name: '', role: 'staff', pin: '' })

// 1. Controllo di sicurezza: se non c'è hotelId, torna al login
if (!hotelId) {
    router.push('/')
}

const fetchData = async () => {
  if (!hotelId) return
  const { data: s } = await supabase.from('staff_members').select('*').eq('hotel_id', hotelId).order('name')
  staffList.value = s || []
  
  // Ordiniamo le stanze per numero (convertendo in numero se necessario per ordinamento corretto 1, 2, 10 invece di 1, 10, 2)
  const { data: r } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId)
  
  if (r) {
      // Piccolo trick per ordinare bene i numeri (es. 10 dopo 2)
      rooms.value = r.sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
  } else {
      rooms.value = []
  }
}

const openStaffModal = () => {
  newStaff.value = { name: '', role: 'staff', pin: '' }
  document.getElementById('staff_modal').showModal()
}

const saveStaff = async () => {
  if (!newStaff.value.name || newStaff.value.pin.length !== 4) return alert('Dati incompleti! Il PIN deve essere di 4 cifre.')
  
  // MODIFICA: Gestione errore duplicati o problemi
  const { error } = await supabase.from('staff_members').insert([{ ...newStaff.value, hotel_id: hotelId }])
  
  if (error) {
      console.error(error)
      alert('Errore durante il salvataggio. Forse il PIN o il nome è duplicato?')
  } else { 
      document.getElementById('staff_modal').close(); 
      fetchData() 
  }
}

const deleteStaff = async (id) => {
  if (!confirm('Eliminare questo membro dello staff?')) return
  await supabase.from('staff_members').delete().eq('id', id)
  fetchData()
}

const addRoom = async () => {
  const num = prompt("Numero della nuova stanza:")
  if (!num) return

  // MODIFICA: Controllo errore (es. stanza già esistente)
  const { error } = await supabase.from('rooms').insert([{ number: num, hotel_id: hotelId, status: 'clean' }])
  
  if (error) {
      // Codice errore 23505 è "Unique Violation" in Postgres
      if (error.code === '23505') alert('Questa stanza esiste già!')
      else alert('Errore creazione stanza: ' + error.message)
  } else {
      fetchData()
  }
}

const deleteRoom = async (id) => {
  if (!confirm('Eliminare la stanza?')) return
  await supabase.from('rooms').delete().eq('id', id)
  fetchData()
}

const getRoleClass = (role) => {
  if (role === 'staff') return 'badge-info text-white'
  if (role === 'maintenance') return 'badge-warning text-white'
  if (role === 'governante') return 'badge-secondary'
  if (role === 'reception') return 'badge-accent text-white'
  return 'badge-ghost'
}

const logout = () => { 
    localStorage.clear(); 
    router.push('/') 
}

onMounted(fetchData)
</script>