<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <div class="navbar bg-white shadow-md px-4 sticky top-0 z-50">
      <div class="flex-1 flex-col items-start">
        <span class="text-xl font-black text-blue-800 uppercase tracking-tighter">{{ hotelName }}</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direzione</span>
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost text-red-500" @click="logout">Esci</button>
    </div>

    <div class="p-4 max-w-5xl mx-auto space-y-6">
      
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-white p-3 rounded shadow border-t-4 border-red-500">
          <div class="text-3xl font-black text-gray-800">{{ dirtyCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Sporche</div>
        </div>
        <div class="bg-white p-3 rounded shadow border-t-4 border-green-500">
          <div class="text-3xl font-black text-gray-800">{{ cleanCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Pulite</div>
        </div>
        <div class="bg-white p-3 rounded shadow border-t-4 border-blue-500">
          <div class="text-3xl font-black text-gray-800">{{ totalCount }}</div>
          <div class="text-[10px] uppercase text-gray-400 font-bold">Totali</div>
        </div>
      </div>

      <div class="card bg-white shadow-sm p-4 border border-blue-100">
        <h3 class="text-sm font-bold text-blue-800 uppercase mb-4 flex items-center gap-2">👥 Il Tuo Team</h3>

        <div class="flex flex-col md:flex-row gap-2 mb-6 bg-blue-50 p-3 rounded">
          <div class="flex-1">
            <label class="label text-[9px] font-bold text-gray-400 uppercase">Nome</label>
            <input v-model="newStaff.name" type="text" placeholder="Es. Anna" class="input input-sm input-bordered w-full" />
          </div>
          <div class="flex-1">
            <label class="label text-[9px] font-bold text-gray-400 uppercase">Ruolo</label>
            <select v-model="newStaff.role" class="select select-sm select-bordered w-full">
              <option value="staff">🧹 Cameriera/e</option>
              <option value="maintenance">🔧 Manutentore</option>
              <option value="governante">👩‍✈️ Governante</option> </select>
          </div>
          <div class="flex-1">
            <label class="label text-[9px] font-bold text-gray-400 uppercase">PIN (4 cifre)</label>
            <input v-model="newStaff.pin" type="text" placeholder="Es. 7777" class="input input-sm input-bordered w-full font-mono text-center" maxlength="4" />
          </div>
          <div class="flex items-end">
            <button @click="addStaff" class="btn btn-sm btn-primary w-full md:w-auto">➕ Aggiungi</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-xs w-full">
            <thead><tr class="bg-gray-50"><th>Nome</th><th>Ruolo</th><th>PIN</th><th></th></tr></thead>
            <tbody>
              <tr v-for="member in staffList" :key="member.id" class="hover:bg-gray-50 border-b">
                <td class="font-bold">{{ member.name }}</td>
                <td>
                  <span class="badge badge-xs text-white font-bold py-2 px-2" 
                    :class="{
                      'badge-error': member.role === 'staff',
                      'badge-warning': member.role === 'maintenance',
                      'badge-secondary': member.role === 'governante'
                    }">
                    {{ member.role.toUpperCase() }}
                  </span>
                </td>
                <td class="font-mono text-gray-400">****</td>
                <td><button @click="deleteStaff(member.id)" class="btn btn-ghost btn-xs text-red-400">🗑️</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="collapse collapse-arrow bg-white shadow-sm">
        <input type="checkbox" /> 
        <div class="collapse-title text-sm font-bold text-gray-500 uppercase">🛏️ Configura Stanze</div>
        <div class="collapse-content">
          <div class="flex gap-2 mb-4 pt-2">
            <input v-model="newRoomNumber" type="text" placeholder="Num. 101" class="input input-bordered input-sm w-full" />
            <button @click="addRoom" class="btn btn-sm btn-outline" :disabled="!newRoomNumber">Crea</button>
          </div>
          <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
            <div v-for="room in rooms" :key="room.id" class="badge badge-lg w-full" :class="room.status === 'clean' ? 'badge-success text-white' : 'badge-ghost'">
              {{ room.number }}
              <button @click="deleteRoom(room.id)" class="ml-2 text-xs font-bold hover:text-red-600">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const rooms = ref([])
const staffList = ref([])
const newRoomNumber = ref('')
const newStaff = reactive({ name: '', role: 'staff', pin: '' })
const hotelId = localStorage.getItem('htlfix_hotel_id')
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'MIO HOTEL'
let pollingInterval = null

const fetchRooms = async () => {
  const { data } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).order('number')
  if (data && JSON.stringify(data) !== JSON.stringify(rooms.value)) rooms.value = data
}

const addRoom = async () => {
  if (!newRoomNumber.value) return
  await supabase.from('rooms').insert([{ number: newRoomNumber.value, status: 'dirty', hotel_id: hotelId }])
  newRoomNumber.value = ''; fetchRooms()
}

const deleteRoom = async (id) => {
  if(!confirm('Eliminare stanza?')) return
  await supabase.from('rooms').delete().eq('id', id)
  fetchRooms()
}

const fetchStaff = async () => {
  const { data } = await supabase.from('staff_members').select('*').eq('hotel_id', hotelId).order('created_at')
  if (data) staffList.value = data
}

const addStaff = async () => {
  if (!newStaff.name || !newStaff.pin) return alert('Dati mancanti')
  await supabase.from('staff_members').insert([{ name: newStaff.name, role: newStaff.role, pin: newStaff.pin, hotel_id: hotelId }])
  newStaff.name = ''; newStaff.pin = ''
  fetchStaff()
  alert('Staff aggiunto!')
}

const deleteStaff = async (id) => {
  if(!confirm('Rimuovere?')) return
  await supabase.from('staff_members').delete().eq('id', id)
  fetchStaff()
}

const cleanCount = computed(() => rooms.value.filter(r => r.status === 'clean').length)
const dirtyCount = computed(() => rooms.value.filter(r => r.status === 'dirty').length)
const totalCount = computed(() => rooms.value.length)
const logout = () => { localStorage.clear(); router.push('/') }

onMounted(() => { fetchRooms(); fetchStaff(); pollingInterval = setInterval(fetchRooms, 1000) })
onUnmounted(() => clearInterval(pollingInterval))
</script>