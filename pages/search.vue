<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Search Anime</h1>

    <div class="relative mb-8">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Mulai ketik untuk mencari anime..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-lg"
        @focus="isSuggestionsVisible = true"
        @blur="hideSuggestions"
      >
      <div v-if="isSuggestionsVisible && suggestions.length > 0" class="absolute top-full left-0 right-0 bg-white border rounded-b-lg shadow-lg z-10">
        <ul>
          <li v-for="suggestion in suggestions" :key="suggestion" 
              @click="selectSuggestion(suggestion)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <p>Mencari...</p>
    </div>

    <div v-else-if="results.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <NuxtLink :to="`/anime/${anime.mal_id}`" v-for="anime in results" :key="anime.mal_id" class="bg-white p-2 rounded shadow text-center block hover:scale-105 transition-transform duration-200">
            <img :src="anime.images.jpg.image_url" :alt="anime.title" class="w-full h-auto rounded">
            <h3 class="font-semibold text-sm mt-2 truncate" :title="anime.title">
                {{ anime.title }}
            </h3>
        </NuxtLink>
    </div>
    
    <div v-else-if="searched && !loading" class="text-center text-gray-500">
      <p>Anime tidak ditemukan. Coba kata kunci lain.</p>
    </div>
  </div>
</template>

<script setup>

import { ref, watch } from 'vue';


const searchQuery = ref('');
const results = ref([]);
const suggestions = ref([]); // <-- State baru untuk sugesti
const isSuggestionsVisible = ref(false); // <-- State untuk menampilkan/menyembunyikan sugesti
const loading = ref(false);
const searched = ref(false);
let debounceTimer = null;

const searchAnime = async (query) => {
  if (query.length < 3) {
    results.value = [];
    suggestions.value = [];
    searched.value = false;
    return;
  }
  
  loading.value = true;
  searched.value = true;

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
    const data = await response.json();

    // Isi kedua state: hasil utama dan sugesti 
    results.value = data.data;
    suggestions.value = data.data.slice(0, 5).map(anime => anime.title);

  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    loading.value = false;
  }
};

// Fungsi saat sugesti diklik
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion; 
  isSuggestionsVisible.value = false; 
  searchAnime(suggestion); 
};

const hideSuggestions = () => {
    setTimeout(() => {
        isSuggestionsVisible.value = false;
    }, 200); 
};


watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer);
  
  if (newQuery.length > 2) {
    isSuggestionsVisible.value = true;
    debounceTimer = setTimeout(() => {
      searchAnime(newQuery);
    }, 500);
  } else {
    results.value = [];
    suggestions.value = [];
    isSuggestionsVisible.value = false;
  }
});
</script>