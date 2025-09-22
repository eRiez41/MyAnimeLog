<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-3xl font-bold mb-6 text-center">Login</h1>
    
    <p v-if="errorMsg" class="bg-red-100 text-red-700 p-3 mb-4 rounded">{{ errorMsg }}</p>

    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="email" class="block text-gray-700 font-semibold mb-2">Email</label>
        <input type="email" v-model="email" placeholder="Your email" required class="w-full px-3 py-2 border rounded-lg"/>
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700 font-semibold mb-2">Password</label>
        <input type="password" v-model="password" placeholder="Your password" required class="w-full px-3 py-2 border rounded-lg"/>
      </div>
      <button type="submit" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
        Login
      </button>
    </form>
    <p class="text-center mt-4 text-sm">
      Don't have an account? <NuxtLink to="/register" class="text-green-600 hover:underline">Register here</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const supabase = useSupabaseClient();
const router = useRouter();

const handleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push('/'); // Redirect ke halaman utama setelah login berhasil
  } catch (error) {
    errorMsg.value = error.message;
  }
};
</script>