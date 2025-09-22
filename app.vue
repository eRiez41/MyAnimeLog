<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Toaster rich-colors position="top-right" />
  </div>
</template>

<script setup>
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'; // <-- TAMBAHKAN BARIS INI
</script>