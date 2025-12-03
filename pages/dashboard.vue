<template>
  <section class="mx-auto max-w-6xl px-6 py-12">
    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm uppercase text-white/60">Project ruimte</p>
        <h1 class="text-3xl font-semibold">Mijn patronen</h1>
      </div>
      <div class="flex gap-3">
        <UButton color="white" variant="soft" icon="i-ph-upload-duotone" @click="openUpload = true">
          Upload
        </UButton>
        <UButton color="violet" icon="i-ph-sign-out-duotone" @click="logout">Uitloggen</UButton>
      </div>
    </div>

    <UCard class="bg-slate-900/60">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">Actieve patronen</span>
          <span class="text-sm text-white/60">{{ patterns?.length ?? 0 }} items</span>
        </div>
      </template>
      <div v-if="pending" class="flex items-center gap-3 text-white/70">
        <ULoader size="lg" /> Laden...
      </div>
      <div v-else-if="!patterns?.length" class="text-white/60">
        Nog geen patronen. Upload je eerste ontwerp.
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <PatternCard v-for="pattern in patterns" :key="pattern._id" :pattern="pattern" />
      </div>
    </UCard>

    <section class="mt-10 grid gap-6 lg:grid-cols-[3fr,2fr]">
      <UCard class="bg-slate-900/60">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Projectorbesturing</span>
            <span v-if="projectorState?.updatedAt" class="text-xs text-white/60">
              Laatst bijgewerkt {{ formatDate(projectorState.updatedAt) }}
            </span>
          </div>
        </template>

        <div class="grid gap-6 md:grid-cols-2">
          <UFormGroup label="Projector patroon" help="Selecteer wat op de Pi getoond wordt">
            <USelectMenu
              v-model="projectorControls.patternId"
              :options="patternOptions"
              placeholder="Kies patroon"
              searchable
            />
          </UFormGroup>
          <UFormGroup label="Zoom" help="0.25x - 3x">
            <input
              v-model.number="projectorControls.zoom"
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              class="w-full accent-violet-500"
            >
            <div class="text-right text-xs text-white/60">{{ projectorControls.zoom.toFixed(2) }}x</div>
          </UFormGroup>
          <UFormGroup label="Offset X (px)">
            <UInput v-model.number="projectorControls.offsetX" type="number" />
          </UFormGroup>
          <UFormGroup label="Offset Y (px)">
            <UInput v-model.number="projectorControls.offsetY" type="number" />
          </UFormGroup>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <UToggle
            v-model="projectorControls.invertColors"
            label="Inverteer kleuren"
            :disabled="projectorSaving"
          />
          <UToggle v-model="projectorControls.mirrorX" label="Spiegel horizontaal" :disabled="projectorSaving" />
          <UToggle v-model="projectorControls.mirrorY" label="Spiegel verticaal" :disabled="projectorSaving" />
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <UButton
            color="white"
            variant="soft"
            icon="i-ph-arrow-counter-clockwise-bold"
            :loading="projectorSaving"
            @click="resetProjector"
          >
            Reset offsets
          </UButton>
          <UButton
            color="violet"
            variant="solid"
            icon="i-ph-copy-duotone"
            :disabled="!projectorUrl"
            @click="copyProjectorLink"
          >
            Kopieer projectorlink
          </UButton>
        </div>
      </UCard>

      <UCard class="bg-slate-900/60">
        <template #header>
          <span class="font-medium">Raspberry Pi instructies</span>
        </template>
        <UAlert
          color="violet"
          variant="soft"
          icon="i-ph-info-duotone"
          title="HDMI Pi modus"
          :description="alertMessage"
        />
        <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
          <li>Voer <code>PROJECTOR_KEY</code> gelijk in `.env` en op de Pi.</li>
          <li>Start het dashboard op je computer en bedien de sliders hier.</li>
          <li>Op de Pi open je <code>{{ projectorUrl || 'http://<server>:3000/projector?key=...' }}</code> in kiosk-modus.</li>
        </ul>
      </UCard>
    </section>

    <UModal v-model="openUpload">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Nieuw patroon</h2>
        </template>
        <form class="space-y-4" @submit.prevent="handleCreate">
          <UFormGroup label="Naam" required>
            <UInput v-model="form.title" placeholder="Kalibratie test" />
          </UFormGroup>
          <UFormGroup label="Beschrijving">
            <UTextarea v-model="form.description" placeholder="Optioneel" />
          </UFormGroup>
          <UFormGroup label="Download link" required>
            <UInput v-model="form.url" placeholder="https://" />
          </UFormGroup>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" @click="openUpload = false">Annuleren</UButton>
            <UButton type="submit" color="violet" :loading="creating">Opslaan</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, reactive, ref, watch } from 'vue'
import type { PatternDocument } from '~/types/patterns'
import type { ProjectorState, ProjectorStatePayload } from '~/types/projector'

const openUpload = ref(false)
const creating = ref(false)
const form = reactive({ title: '', description: '', url: '' })

const {
  data: patterns,
  pending,
  refresh,
} = await useAsyncData<PatternDocument[]>('patterns', () => $fetch('/api/patterns'))

const toast = useToast()

type ProjectorStateResponse = ProjectorState & { projectorKey?: string }

const projectorDefaults: ProjectorStatePayload = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  invertColors: false,
  mirrorX: false,
  mirrorY: false,
}

const projectorControls = reactive({
  patternId: '',
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  invertColors: false,
  mirrorX: false,
  mirrorY: false,
})

const projectorState = ref<ProjectorStateResponse | null>(null)
const projectorSaving = ref(false)
const controlsReady = ref(false)

const { data: projectorData } = await useAsyncData<ProjectorStateResponse>('projector-state', () =>
  $fetch('/api/projector/state'),
)

const syncControls = (value: ProjectorStateResponse | null) => {
  if (!value) return
  controlsReady.value = false
  projectorState.value = value
  Object.assign(projectorControls, {
    patternId: value.patternId ?? '',
    zoom: value.zoom,
    offsetX: value.offsetX,
    offsetY: value.offsetY,
    invertColors: value.invertColors,
    mirrorX: value.mirrorX,
    mirrorY: value.mirrorY,
  })
  controlsReady.value = true
}

watch(projectorData, (value) => syncControls(value), { immediate: true })

const pushProjectorUpdate = async (partial: ProjectorStatePayload) => {
  if (!controlsReady.value) return
  try {
    projectorSaving.value = true
    const next = await $fetch<ProjectorStateResponse>('/api/projector/state', {
      method: 'POST',
      body: partial,
    })
    syncControls(next)
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Projector update mislukt', color: 'red' })
  } finally {
    projectorSaving.value = false
  }
}

const debouncedUpdate = useDebounceFn((payload: ProjectorStatePayload) => {
  pushProjectorUpdate(payload)
}, 200)

watch(
  () => projectorControls.zoom,
  (value) => controlsReady.value && debouncedUpdate({ zoom: value }),
)

watch(
  () => projectorControls.offsetX,
  (value) => controlsReady.value && debouncedUpdate({ offsetX: value }),
)

watch(
  () => projectorControls.offsetY,
  (value) => controlsReady.value && debouncedUpdate({ offsetY: value }),
)

watch(
  () => projectorControls.patternId,
  (value) => controlsReady.value && pushProjectorUpdate({ patternId: value || null }),
)

watch(
  () => projectorControls.invertColors,
  (value) => controlsReady.value && pushProjectorUpdate({ invertColors: value }),
)

watch(
  () => projectorControls.mirrorX,
  (value) => controlsReady.value && pushProjectorUpdate({ mirrorX: value }),
)

watch(
  () => projectorControls.mirrorY,
  (value) => controlsReady.value && pushProjectorUpdate({ mirrorY: value }),
)

const resetProjector = async () => {
  controlsReady.value = false
  Object.assign(projectorControls, {
    zoom: projectorDefaults.zoom,
    offsetX: projectorDefaults.offsetX,
    offsetY: projectorDefaults.offsetY,
    invertColors: projectorDefaults.invertColors,
    mirrorX: projectorDefaults.mirrorX,
    mirrorY: projectorDefaults.mirrorY,
  })
  controlsReady.value = true
  await pushProjectorUpdate(projectorDefaults)
}

const projectorKey = computed(() => projectorState.value?.projectorKey ?? '')
const projectorUrl = computed(() => {
  if (!projectorKey.value) return ''
  if (typeof window === 'undefined') return `http://<server>:3000/projector?key=${projectorKey.value}`
  return `${window.location.origin}/projector?key=${projectorKey.value}`
})

const copyProjectorLink = async () => {
  if (!projectorUrl.value || typeof navigator === 'undefined') return
  await navigator.clipboard.writeText(projectorUrl.value)
  toast.add({ title: 'Projectorlink gekopieerd', color: 'violet' })
}

const patternOptions = computed(() =>
  (patterns.value ?? []).map((pattern) => ({ label: pattern.title, value: pattern._id })),
)

const alertMessage = computed(() =>
  projectorKey.value
    ? `Gebruik ${projectorUrl.value || 'http://<server>:3000/projector?key=...'} op de Pi`
    : 'Voeg PROJECTOR_KEY toe aan je .env om remote projectie te activeren.',
)

const formatDate = (input: string) =>
  new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(input))

const handleCreate = async () => {
  creating.value = true
  try {
    await $fetch('/api/patterns', {
      method: 'POST',
      body: form,
    })
    toast.add({ title: 'Patroon toegevoegd', color: 'violet' })
    Object.assign(form, { title: '', description: '', url: '' })
    openUpload.value = false
    await refresh()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout'
    toast.add({ title: 'Mislukt', description: message, color: 'red' })
  } finally {
    creating.value = false
  }
}

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/')
}

definePageMeta({ middleware: 'auth' })
</script>
