<template>
  <div class="flex w-full">
    <div class="flex flex-col flex-1 min-h-screen">
      <div class="overflow-hidden h-screen">
        <main class="flex overflow-y-auto flex-col flex-1 w-full h-full"><slot /></main>
      </div>
    </div>
  </div>
</template>
