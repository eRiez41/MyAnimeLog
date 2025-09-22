<template>
  <div>
    <div v-if="pendingDetail" class="text-center p-10">Loading anime details...</div>
    <div v-else-if="errorDetail" class="text-center p-10 text-red-500">Failed to load anime data.</div>
    
    <div v-else-if="anime" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1">
            <img :src="anime.data.images.jpg.large_image_url" :alt="anime.data.title" class="w-full h-auto rounded-lg shadow-lg">
          </div>
          <div class="md:col-span-2">
            <h1 class="text-4xl font-bold mb-2">{{ anime.data.title }}</h1>
            <h2 class="text-xl text-gray-600 mb-4">{{ anime.data.title_japanese }}</h2>
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex items-center text-lg font-semibold">
                <span class="text-yellow-500 mr-1">⭐</span>
                <span>{{ anime.data.score }}</span>
              </div>
              <div class="text-gray-500">|</div>
              <div class="font-semibold">{{ anime.data.type }} - {{ anime.data.episodes }} episodes</div>
            </div>
            <p class="text-gray-700 leading-relaxed">{{ anime.data.synopsis }}</p>
          </div>
        </div>
      </div>

      <div v-if="user" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-2xl font-bold mb-4">My Watchlist</h3>
        
        <div v-if="loadingWatchlistStatus" class="text-center text-gray-500">Loading your status...</div>
        <form v-else @submit.prevent="handleUpsertWatchlist">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="status" class="block font-semibold mb-1">Status</label>
              <select v-model="watchlistStatus" id="status" class="w-full p-2 border rounded-lg bg-white">
                <option>Plan to Watch</option>
                <option>Watching</option>
                <option>Completed</option>
                <option>On-Hold</option>
                <option>Dropped</option>
              </select>
            </div>
            <div>
              <label for="score" class="block font-semibold mb-1">My Score (0-10)</label>
              <input v-model.number="watchlistScore" type="number" id="score" min="0" max="10" class="w-full p-2 border rounded-lg">
            </div>
          </div>
          
          <button type="submit" class="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
            {{ existingWatchlistItem ? 'Update Watchlist' : 'Add to My List' }}
          </button>
          
          <button v-if="existingWatchlistItem" @click="handleRemoveFromWatchlist" type="button" class="mt-2 w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
            Remove from List
          </button>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-2xl font-bold mb-4">Episode List</h3>
        <div v-if="pendingEpisodes">Loading episodes...</div>
        <div v-else-if="errorEpisodes" class="text-red-500">Failed to load episodes.</div>
        <div v-else-if="episodes && episodes.data.length > 0">
          <ul class="space-y-2" v-auto-animate>
            <li v-for="episode in episodes.data" :key="episode.mal_id" class="bg-gray-50 rounded-md overflow-hidden">
              <button @click="toggleEpisode(episode.mal_id)" class="w-full text-left p-3 font-semibold text-green-700">
                <span>Eps {{ episode.mal_id }}: {{ episode.title }}</span>
              </button>
              <div v-if="openEpisodeId === episode.mal_id" class="px-4 pb-4 border-t pt-4 mt-2">
                <div v-if="loadingEpisodeDetail" class="text-gray-500">Loading details...</div>
                <div v-else-if="episodeDetailsCache[episode.mal_id]">
                  <p v-if="episodeDetailsCache[episode.mal_id].score > 0" class="font-semibold mb-2">
                    ⭐ Score: {{ episodeDetailsCache[episode.mal_id].score }}
                  </p>
                  <p class="text-sm text-gray-700 mb-2">
                    {{ episodeDetailsCache[episode.mal_id].synopsis || 'No synopsis available for this episode.' }}
                  </p>
                  <a :href="episodeDetailsCache[episode.mal_id].url" target="_blank" rel="noopener noreferrer" class="text-sm text-blue-500 hover:underline">
                    View on MyAnimeList
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-500">Episode list is not available.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';

const route = useRoute();
const animeId = parseInt(route.params.id, 10);

// Fetch data utama
const { data: anime, pending: pendingDetail, error: errorDetail } = await useFetch(`https://api.jikan.moe/v4/anime/${animeId}`);
const { data: episodes, pending: pendingEpisodes, error: errorEpisodes } = await useFetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);

// --- Logika Supabase & Watchlist ---
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const watchlistStatus = ref('Plan to Watch');
const watchlistScore = ref(0);
const existingWatchlistItem = ref(null);
const loadingWatchlistStatus = ref(true);

onMounted(async () => {
  if (!user.value) {
    loadingWatchlistStatus.value = false;
    return;
  }
  try {
    const { data, error } = await supabase.from('watchlist').select('*').eq('user_id', user.value.id).eq('anime_id', animeId).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      existingWatchlistItem.value = data;
      watchlistStatus.value = data.status;
      watchlistScore.value = data.score;
    }
  } catch (e) {
    console.error('Error checking watchlist status:', e);
  } finally {
    loadingWatchlistStatus.value = false;
  }
});

const handleUpsertWatchlist = async () => {
  if (!user.value) {
    if (process.client) toast.error('You must be logged in.');
    return;
  }
  const watchlistItem = {
    user_id: user.value.id,
    anime_id: animeId,
    anime_title: anime.value.data.title,
    anime_image: anime.value.data.images.jpg.image_url,
    status: watchlistStatus.value,
    score: watchlistScore.value,
  };
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .upsert(watchlistItem, { onConflict: 'user_id, anime_id' })
      .select()
      .single();
    if (error) throw error;
    existingWatchlistItem.value = data;
    if (process.client) toast.success('Watchlist updated successfully!');
  } catch (error) {
    if (process.client) toast.error('Error updating watchlist: ' + error.message);
  }
};


const handleRemoveFromWatchlist = () => {
  if (!existingWatchlistItem.value) return;

  toast.warning(`Are you sure you want to remove "${anime.value.data.title}"?`, {
    action: {
      label: 'Yes, remove it',
      onClick: async () => {
        try {
          const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('id', existingWatchlistItem.value.id);

          if (error) throw error;

          existingWatchlistItem.value = null;
          watchlistStatus.value = 'Plan to Watch';
          watchlistScore.value = 0;
          toast.success('Successfully removed from your watchlist.');
        } catch (err) {
          toast.error('Error removing from watchlist: ' + err.message);
        }
      }
    },
    cancel: {
      label: 'Cancel'
    }
  });
};

// --- Logika Accordion Episode ---
const openEpisodeId = ref(null);
const episodeDetailsCache = ref({});
const loadingEpisodeDetail = ref(false);

const toggleEpisode = async (episodeId) => {
  if (openEpisodeId.value === episodeId) {
    openEpisodeId.value = null;
    return;
  }
  openEpisodeId.value = episodeId;
  if (!episodeDetailsCache.value[episodeId]) {
    loadingEpisodeDetail.value = true;
    try {
      const response = await $fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes/${episodeId}`);
      episodeDetailsCache.value[episodeId] = response.data;
    } catch (e) {
      console.error('Failed to fetch episode detail:', e);
      episodeDetailsCache.value[episodeId] = { synopsis: 'Failed to load details.' };
    } finally {
      loadingEpisodeDetail.value = false;
    }
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>