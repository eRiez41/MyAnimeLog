// file: middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // Jika user belum login dan mencoba akses halaman yang bukan login/register
  if (!user.value && to.path !== '/login' && to.path !== '/register') {
    // Arahkan dia ke halaman login
    return navigateTo('/login');
  }
});