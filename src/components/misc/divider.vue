<template>
  <div class="relative">
    <div class="flex absolute inset-0 items-center" aria-hidden="true">
      <div class="w-full border-t border-slate-300" />
    </div>
    <div class="flex relative justify-start">
      <span class="pr-3 text-base font-semibold leading-6 bg-white text-slate-900"><slot /></span>
    </div>
  </div>
</template>
