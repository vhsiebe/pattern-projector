<template>
  <UCard class="h-full bg-slate-900/60">
    <div class="flex flex-col gap-3">
      <UIcon :name="icon" size="28" class="text-violet-300" />
      <h3 class="text-xl font-semibold">{{ title }}</h3>
      <p class="text-sm text-white/70">
        {{ description }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

defineProps<Props>()
</script>
