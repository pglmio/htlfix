<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
           <img src="/logo.png" alt="HTLfix Logo" class="h-12 w-12 object-cover rounded-lg">
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900">HTLfix Accesso</h2>
        <p class="mt-2 text-sm text-gray-600">Inserisci il tuo codice invito per creare l'account.</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegistration">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label class="sr-only">Email</label>
            <input v-model="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email Address">
          </div>
          <div>
            <label class="sr-only">Password</label>
            <input v-model="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Password">
          </div>
          <div>
            <label class="sr-only">Codice Invito</label>
            <input v-model="inviteCode" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-indigo-300 placeholder-gray-400 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase tracking-widest font-bold bg-indigo-50" placeholder="CODICE INVITO (es. HTL-9922)">
          </div>
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="loading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          <span v-if="loading">Verifica e Creazione...</span>
          <span v-else>Riscatta Invito e Registrati</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase'; // Assicurati di importare il client Supabase corretto
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const inviteCode = ref('');
const loading = ref(false);
const errorMsg = ref('');
const router = useRouter();

const handleRegistration = async () => {
  loading.value = true;
  errorMsg.value = '';

  try {
    // 1. Prima controlliamo se il codice è valido (senza bruciarlo ancora)
    const { data: codeData, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', inviteCode.value)
      .eq('is_used', false)
      .single();

    if (codeError || !codeData) {
      throw new Error('Codice invito non valido o già utilizzato.');
    }

    // 2. Registriamo l'utente su Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Errore nella creazione utente.');

    // 3. "BRUCIAMO" IL CODICE: Lo colleghiamo all'utente appena creato
    const { data: claimResult, error: claimError } = await supabase
      .rpc('claim_access_code', { 
        input_code: inviteCode.value, 
        user_id: authData.user.id 
      });

    if (claimError || !claimResult) {
      // Caso limite: Il codice è stato rubato mentre l'utente si registrava
      throw new Error('Errore critico: Codice non più valido.'); 
    }

    // 4. Successo
    alert('Account creato con successo! Benvenuto in HTLfix.');
    router.push('/dashboard'); // O dove vuoi portarlo

  } catch (e) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>