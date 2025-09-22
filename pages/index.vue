<template>
  <div class="space-y-12">
    <section class="text-center py-16 bg-white rounded-lg shadow-md">
      <h1 class="text-5xl font-extrabold text-gray-800">
        Discover & Track Your Anime Journey
      </h1>
      <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Your personal log for every series you've watched, are watching, or plan to watch. Powered by the Jikan API.
      </p>
      <NuxtLink to="/search" class="mt-8 inline-block bg-green-600 text-white font-bold text-lg py-3 px-8 rounded-lg hover:bg-green-700 transition-transform hover:scale-105">
        Start Searching Now
      </NuxtLink>
    </section>

    <section>
      <h2 class="text-3xl font-bold mb-6">Top Airing Anime This Season</h2>

      <div v-if="pending" class="text-center">Loading...</div>
      
      <div v-else-if="error" class="text-center text-red-500">Could not fetch data. Please try again later.</div>
      
      <div v-else-if="airingAnime && airingAnime.data" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <NuxtLink 
          v-for="anime in airingAnime.data" 
          :key="anime.mal_id" 
          :to="`/anime/${anime.mal_id}`" 
          class="bg-white rounded-lg shadow text-center block hover:scale-105 transition-transform duration-200 overflow-hidden group"
        >
          <img :src="anime.images.jpg.large_image_url" :alt="anime.title" class="w-full h-72 object-cover">
          <h3 class="font-semibold text-sm p-2 truncate group-hover:text-green-600" :title="anime.title">
            {{ anime.title }}
          </h3>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const { data: airingAnime, pending, error } = await useFetch(
  'https://api.jikan.moe/v4/seasons/now?limit=12'
);
</script>