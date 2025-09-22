<template>
  <div class="bg-gray-100 min-h-screen text-gray-800">
    <header class="bg-white shadow-md relative z-10">
      <nav class="container mx-auto p-4 flex justify-between items-center">
        <NuxtLink to="/" class="font-bold text-xl text-green-600">MyAnimeLog</NuxtLink>
        <ul class="flex space-x-4 items-center">
          <li v-if="user"><NuxtLink to="/profile" class="hover:text-green-600">My Watchlist</NuxtLink></li>
          <li><NuxtLink to="/search" class="hover:text-green-600">Search</NuxtLink></li>

          <li v-if="user">
            <button @click="handleLogout" class="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600">Logout</button>
          </li>
          <li v-else>
            <NuxtLink to="/login" class="hover:text-green-600">Login</NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="container mx-auto p-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};
</script>