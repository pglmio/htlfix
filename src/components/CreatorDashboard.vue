<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">🔑 Dashboard Creatore (Admin)</h1>

    <div class="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Genera Nuovo Codice</h3>
          <p class="text-sm text-gray-500">Crea un codice univoco per un cliente pagante.</p>
        </div>
        <button @click="createCode" class="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
          + Genera Codice
        </button>
      </div>

      <div v-if="generatedCode" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
        <span class="text-2xl font-mono font-bold text-green-800 tracking-wider">{{ generatedCode }}</span>
        <button @click="copyCode" class="text-sm text-green-700 underline cursor-pointer hover:text-green-900">Copia</button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 class="font-semibold text-gray-700">Ultimi Codici Generati</h3>
      </div>
      <ul>
        <li v-for="c in codes" :key="c.id" class="px-6 py-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50">
          <div>
            <span class="font-mono font-bold text-lg">{{ c.code }}</span>
            <div class="text-xs text-gray-400">{{ new Date(c.created_at).toLocaleDateString() }}</div>
          </div>
          <span :class="c.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'" class="px-3 py-1 rounded-full text-xs font-bold uppercase">
            {{ c.is_used ? 'USATO' : 'ATTIVO' }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';

const generatedCode = ref('');
const codes = ref([]);

// Funzione per creare codice casuale
const createCode = async () => {
  // Genera stringa tipo HTL-A1B2
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newCodeString = `HTL-${randomStr}`;

  const { data, error } = await supabase
    .from('access_codes')
    .insert([{ code: newCodeString }])
    .select();

  if (error) {
    alert('Errore generazione: ' + error.message);
  } else {
    generatedCode.value = newCodeString;
    loadCodes(); // Ricarica la lista
  }
};

const copyCode = () => {
  navigator.clipboard.writeText(generatedCode.value);
  alert('Copiato!');
};

const loadCodes = async () => {
  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (data) codes.value = data;
};

onMounted(() => {
  loadCodes();
});
</script>