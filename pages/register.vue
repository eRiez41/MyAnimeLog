<template>
  <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-3xl font-bold mb-6 text-center">Register</h1>

    <p v-if="successMsg" class="bg-green-100 text-green-700 p-3 mb-4 rounded">{{ successMsg }}</p>
    <p v-if="errorMsg" class="bg-red-100 text-red-700 p-3 mb-4 rounded">{{ errorMsg }}</p>

    <form @submit.prevent="handleRegister">
      <div class="mb-4">
        <label for="email" class="block text-gray-700 font-semibold mb-2">Email</label>
        <input type="email" v-model="email" placeholder="Your email" required class="w-full px-3 py-2 border rounded-lg"/>
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700 font-semibold mb-2">Password</label>
        <input type="password" v-model="password" placeholder="Choose a strong password" required class="w-full px-3 py-2 border rounded-lg"/>
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
        Register
      </button>
    </form>
     <p class="text-center mt-4 text-sm">
      Already have an account? <NuxtLink to="/login" class="text-green-600 hover:underline">Login here</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const successMsg = ref('');

const supabase = useSupabaseClient();

const handleRegister = async () => {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    successMsg.value = 'Registration successful! Please check your email to confirm your account.';
    errorMsg.value = '';
  } catch (error) {
    errorMsg.value = error.message;
    successMsg.value = '';
  }
};
</script>