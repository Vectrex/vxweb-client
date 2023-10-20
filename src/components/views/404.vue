<template>
  <div class="flex flex-col justify-center items-center w-full h-screen bg-vxvue-50">
    <h1 class="text-9xl font-extrabold tracking-widest text-vxvue-900">404</h1>
    <div class="absolute py-1 px-4 font-bold rounded rotate-12 bg-vxvue text-vxvue-900">
      Page Not Found
    </div>
    <router-link :to="{ path: '/'}" class="font-bold link">Go Home</router-link>
  </div>
404!
</template>
