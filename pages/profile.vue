<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Watchlist</h1>
    </div>

    <div class="flex flex-wrap gap-2 mb-6 border-b pb-2">
      <button 
        @click="selectedStatus = 'All'" 
        :class="{'bg-green-600 text-white': selectedStatus === 'All', 'bg-gray-200 text-gray-700 hover:bg-gray-300': selectedStatus !== 'All'}"
        class="px-4 py-1 rounded-full text-sm font-semibold transition-colors"
      >
        All
      </button>
      <button 
        v-for="status in statuses" 
        :key="status" 
        @click="selectedStatus = status"
        :class="{'bg-green-600 text-white': selectedStatus === status, 'bg-gray-200 text-gray-700 hover:bg-gray-300': selectedStatus !== status}"
        class="px-4 py-1 rounded-full text-sm font-semibold transition-colors"
      >
        {{ status }}
      </button>
    </div>

    <div v-if="loading" class="text-center">Loading your watchlist...</div>
    <div v-else-if="error" class="text-center text-red-500">
      Error loading watchlist: {{ error.message }}
    </div>
    
    <div v-else-if="filteredWatchlist.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" v-auto-animate>
      <div v-for="item in filteredWatchlist" :key="item.id">
        <div class="bg-white rounded-lg shadow text-center overflow-hidden group">
          <NuxtLink :to="`/anime/${item.anime_id}`" class="block hover:scale-105 transition-transform duration-200">
            <img :src="item.anime_image" :alt="item.anime_title" class="w-full h-72 object-cover">
          </NuxtLink>
          <div class="p-2">
            <h3 class="font-semibold text-sm truncate group-hover:text-green-600" :title="item.anime_title">
              {{ item.anime_title }}
            </h3>
            <p class="text-xs text-gray-500 mt-1">{{ item.status }} - ⭐ {{ item.score }}</p>
            <button 
              @click="handleDelete(item.id, item.anime_title)"
              class="text-xs text-red-500 hover:underline mt-1"
            >
              Remove
            </button>
          </div>
        </div>
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
import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue-sonner';

definePageMeta({
  middleware: 'auth'
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const watchlist = ref([]);
const loading = ref(true);
const error = ref(null);

// Logika Filter
const statuses = ['Watching', 'Completed', 'Plan to Watch', 'On-Hold', 'Dropped'];
const selectedStatus = ref('All');

const filteredWatchlist = computed(() => {
  if (selectedStatus.value === 'All') {
    return watchlist.value;
  }
  return watchlist.value.filter(item => item.status === selectedStatus.value);
});

// Mengambil data saat halaman dibuka
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

// Fungsi untuk menghapus data
const handleDelete = (itemId, itemTitle) => {
  toast.warning(`Are you sure you want to delete "${itemTitle}"?`, {
    action: {
      label: 'Yes, delete it',
      onClick: async () => {
        try {
          const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('id', itemId);

          if (error) throw error;

          watchlist.value = watchlist.value.filter(item => item.id !== itemId);
          toast.success(`"${itemTitle}" was successfully deleted.`);
        } catch (err) {
          toast.error('Failed to delete item: ' + err.message);
        }
      }
    },
    cancel: {
      label: 'Cancel'
    }
  });
};
</script>