<template>
  <div class="min-h-screen bg-orange-50 pb-20">
    <div class="navbar bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div class="flex-1 flex-col items-start ml-2">
        <span class="font-bold text-xs opacity-80 uppercase tracking-widest">{{ hotelName }}</span>
        <span class="font-black text-xl">MANUTENZIONE</span>
      </div>
      <button class="btn btn-sm btn-ghost text-white" @click="logout">Esci</button>
    </div>

    <div class="p-10 flex flex-col items-center justify-center text-center opacity-40 mt-10">
      <div class="text-6xl mb-4">🔧</div>
      <h2 class="text-2xl font-bold text-gray-500">Nessun guasto attivo</h2>
      <p class="text-sm">Tutto funziona correttamente.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
// Recupera il nome dell'hotel
const hotelName = localStorage.getItem('htlfix_hotel_name') || 'HOTEL'

const logout = () => { localStorage.clear(); router.push('/') }
</script>