<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
    
    <div class="text-center mb-8 flex flex-col items-center">
      <img src="../assets/logo.png" alt="HTLfix Logo" class="w-1 mb-4" />
      <h1 class="text-2xl font-black tracking-tighter text-primary">HTLfix</h1>
      <p class="text-sm text-base-content/60 uppercase tracking-widest font-bold">
        Hotel Assistant
      </p>
    </div>

    <div class="card w-full max-w-xs bg-base-100 shadow-xl border border-base-300">
      <div class="card-body">
        <h2 class="card-title justify-center mb-6 text-lg">Identificati</h2>

        <div v-if="errorMsg" class="alert alert-error text-xs py-2 mb-4 flex justify-center">
          <span>{{ errorMsg }}</span>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Inserisci PIN Staff</span>
          </label>
          <input 
            type="password" 
            placeholder="****" 
            class="input input-bordered input-primary text-center text-3xl tracking-[1rem] font-bold h-16" 
            v-model="pin"
            maxlength="4"
            @keyup.enter="handleLogin"
            autofocus
          />
        </div>

        <div class="form-control mt-6">
          <button 
            class="btn btn-primary btn-lg w-full" 
            :class="{ 'loading': loading }" 
            @click="handleLogin"
            :disabled="pin.length < 4"
          >
            ENTRA
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 text-xs text-base-content/30 text-center font-mono">
      <p>PIN DEBUG:</p>
      <p>Dir: 9999 | Rec: 1234 | Staff: 0000</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase' 

const router = useRouter()
const pin = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  if (pin.value.length < 4) return
  
  loading.value = true

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('pin_code', pin.value)
      .eq('active', true)
      .single()

    if (error || !data) throw new Error('PIN non trovato')

    localStorage.setItem('htlfix_user', JSON.stringify(data))

    if (data.role === 'director') {
      router.push('/admin')
    } else if (data.role === 'reception') {
      router.push('/reception')
    } else {
      router.push('/staff')
    }

  } catch (err) {
    console.error(err)
    errorMsg.value = 'PIN Errato'
    pin.value = ''
  } finally {
    loading.value = false
  }
}
</script>