<template>
  <section class="flex min-h-screen flex-col">
    <header class="flex items-center justify-between border-b border-white/10 bg-black/70 px-6 py-4 text-sm uppercase tracking-widest">
      <span>Projector modus</span>
      <span class="text-white/60">Laat dit venster op HDMI staan</span>
    </header>
    <div class="relative flex-1 overflow-hidden bg-black">
      <div class="absolute inset-0 flex items-center justify-center">
        <div v-if="!state?.pattern" class="text-center text-white/50">
          <p class="text-lg font-semibold">Nog geen patroon geselecteerd</p>
          <p class="text-sm">Open het dashboard op je computer en kies een patroon.</p>
        </div>
        <div
          v-else
          class="relative max-h-full max-w-full origin-center"
          :style="viewerStyle"
        >
          <iframe
            :src="state.pattern.url"
            class="h-[120vh] w-[120vw] border-0"
            sandbox="allow-scripts allow-same-origin"
            referrerpolicy="no-referrer"
          />
          <div class="absolute left-4 top-4 rounded bg-black/60 px-3 py-1 text-xs uppercase tracking-wide">
            {{ state.pattern.title }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import type { ProjectorState } from '~/types/projector'

const route = useRoute()
const pollMs = useRuntimeConfig().public.projectorPollInterval || 1500
const state = ref<ProjectorState | null>(null)
const keyParam = computed(() => route.query.key as string | undefined)

const fetchState = async () => {
  try {
    state.value = await $fetch<ProjectorState>('/api/projector/state', {
      query: keyParam.value ? { key: keyParam.value } : undefined,
    })
  } catch (error) {
    console.error('Kon projector-status niet laden', error)
  }
}

await fetchState()
useIntervalFn(fetchState, pollMs)
watch(keyParam, fetchState)

definePageMeta({
  layout: 'projector',
  middleware: 'projector-view',
})

const viewerStyle = computed(() => {
  if (!state.value) return {}
  const transforms = [
    `translate(${state.value.offsetX}px, ${state.value.offsetY}px)`,
    `scale(${state.value.zoom})`,
    state.value.mirrorX ? 'scaleX(-1)' : '',
    state.value.mirrorY ? 'scaleY(-1)' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    transform: transforms,
    filter: state.value.invertColors ? 'invert(1)' : 'none',
    transition: 'transform 120ms ease-out',
  }
})
</script>
