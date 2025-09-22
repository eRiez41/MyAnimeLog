<template>
  <div class="text-center p-10">
    Waiting for login...
  </div>
</template>

<script setup>
const user = useSupabaseUser();

watch(user, () => {
  if (user.value) {
    // Arahkan ke halaman utama jika user sudah terdeteksi
    return navigateTo('/');
  }
}, { immediate: true });
</script>