<template>
  <section class="mx-auto max-w-4xl px-6 py-12 space-y-8">
    <div>
      <p class="text-sm uppercase text-white/60">Kalibratie</p>
      <h1 class="text-3xl font-semibold">Projector uitlijnen</h1>
      <p class="text-white/70">
        Deze pagina simuleert de oude canvas tools en toont hoe Nuxt UI componenten gebruikt worden
        om overlays, meetpunten en helper kaarten te renderen. De daadwerkelijke rendering kan verder
        uitgebreid worden met WebGL of HTML canvas.
      </p>
    </div>
    <UCard class="bg-black/40">
      <div
        class="relative aspect-[4/3] w-full rounded-lg border border-dashed border-violet-400 bg-gradient-to-br from-slate-900 to-slate-800"
      >
        <div
          class="absolute inset-8 grid grid-cols-4 grid-rows-4 text-white/40"
          style="background-image: linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 25%;"
        >
          <span
            v-for="i in 16"
            :key="i"
            class="flex items-center justify-center text-xs"
          >
            {{ i }}
          </span>
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="rounded-full border-2 border-violet-300/80 p-10 text-white">Focus</div>
        </div>
      </div>
    </UCard>
  </section>
</template>
