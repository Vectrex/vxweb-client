<template>
  <div class="h-screen w-full flex flex-col justify-center items-center bg-vxvue-50">
    <h1 class="text-9xl font-extrabold text-vxvue-900 tracking-widest">404</h1>
    <div class="bg-vxvue px-4 py-1 text-vxvue-900 font-bold rounded rotate-12 absolute">
      Page Not Found
    </div>
    <router-link :to="{ path: '/'}" class="link font-bold">Go Home</router-link>
  </div>
404!
</template>
