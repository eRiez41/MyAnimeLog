<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Watchlist</h1>
    </div>

    <div class="flex space-x-2 mb-6 border-b pb-2">
      <button 
        @click="selectedStatus = 'All'" 
        :class="{'bg-green-600 text-white': selectedStatus === 'All', 'bg-gray-200 text-gray-700': selectedStatus !== 'All'}"
        class="px-4 py-1 rounded-full text-sm font-semibold"
      >
        All
      </button>
      <button 
        v-for="status in statuses" 
        :key="status" 
        @click="selectedStatus = status"
        :class="{'bg-green-600 text-white': selectedStatus === status, 'bg-gray-200 text-gray-700': selectedStatus !== status}"
        class="px-4 py-1 rounded-full text-sm font-semibold"
      >
        {{ status }}
      </button>
    </div>
    <div v-if="loading" class="text-center">Loading your watchlist...</div>
    <div v-else-if="error" class="text-center text-red-500">
      Error loading watchlist: {{ error.message }}
    </div>
    
    <div v-else-if="filteredWatchlist.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div v-for="item in filteredWatchlist" :key="item.id">
        <NuxtLink :to="`/anime/${item.anime_id}`" class="bg-white rounded-lg shadow text-center block hover:scale-105 transition-transform duration-200 overflow-hidden group">
          <img :src="item.anime_image" :alt="item.anime_title" class="w-full h-72 object-cover">
          <div class="p-2">
            <h3 class="font-semibold text-sm truncate group-hover:text-green-600" :title="item.anime_title">
              {{ item.anime_title }}
            </h3>
            <p class="text-xs text-gray-500 mt-1">{{ item.status }} - ⭐ {{ item.score }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold">No items found for this status!</h2>
      <p class="text-gray-500 mt-2">Try selecting another status or add more anime to your list.</p>
      <NuxtLink to="/search" class="mt-4 inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">
        Search Anime
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // <-- Tambahkan computed
    
definePageMeta({
  middleware: 'auth'
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const watchlist = ref([]);
const loading = ref(true);
const error = ref(null);

// --- BAGIAN BARU: LOGIKA FILTER ---
const statuses = ['Watching', 'Completed', 'Plan to Watch', 'On-Hold', 'Dropped'];
const selectedStatus = ref('All');

// Ini adalah "catatan kecil" yang reaktif
const filteredWatchlist = computed(() => {
  if (selectedStatus.value === 'All') {
    return watchlist.value; // Jika 'All', tampilkan semua
  }
  // Jika tidak, filter daftar utama berdasarkan status yang dipilih
  return watchlist.value.filter(item => item.status === selectedStatus.value);
});
// ---------------------------------

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    
    watchlist.value = data;
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});
</script>