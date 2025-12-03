<template>
  <UCard class="bg-slate-900/60">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm uppercase text-white/60">{{ formattedDate }}</p>
          <h3 class="text-xl font-semibold">{{ pattern.title }}</h3>
        </div>
        <UButton
          color="white"
          variant="soft"
          size="sm"
          icon="i-ph-download-simple-duotone"
          :to="pattern.url"
          target="_blank"
        />
      </div>
    </template>
    <p class="text-white/70">{{ pattern.description }}</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PatternDocument } from '~/types/patterns'

const props = defineProps<{ pattern: PatternDocument }>()

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(props.pattern.createdAt),
  ),
)
</script>
