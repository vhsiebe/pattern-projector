<template>
  <UContainer class="space-y-10 py-10">
    <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <UCard class="bg-gradient-to-br from-violet-600/50 to-indigo-700/40 text-white shadow-2xl">
        <div class="flex flex-col gap-6">
          <div class="space-y-3">
            <UBadge color="white" variant="soft" class="text-black/80">Creatieve cockpit</UBadge>
            <h1 class="text-4xl font-semibold leading-tight">
              Projecteer patronen met vertrouwen en realtime controle.
            </h1>
            <p class="text-white/80">
              Upload nieuwe patronen, kalibreer je projector en deel instellingen met je Raspberry Pi of elk ander
              apparaat dat inlogt op dit dashboard.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <UButton size="lg" color="white" icon="i-ph-upload-duotone" @click="openUpload = true">
              Nieuw patroon
            </UButton>
            <UButton
              size="lg"
              color="gray"
              variant="soft"
              icon="i-ph-projector-screen-duotone"
              :to="projectorUrl || '/projector'"
            >
              Open projector
            </UButton>
            <UButton size="lg" variant="ghost" color="white" icon="i-ph-sign-out-duotone" @click="logout">
              Uitloggen
            </UButton>
          </div>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p class="text-sm uppercase text-white/70">Patronen</p>
              <p class="text-3xl font-semibold">{{ patternCount }}</p>
              <p class="text-xs text-white/70">Beschikbaar in de bibliotheek</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p class="text-sm uppercase text-white/70">Projector</p>
              <p class="text-3xl font-semibold">{{ projectorStatusLabel }}</p>
              <p class="text-xs text-white/70">{{ activePatternTitle }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p class="text-sm uppercase text-white/70">Sessies</p>
              <p class="text-3xl font-semibold">{{ projectorKey ? 'Remote' : 'Lokaal' }}</p>
              <p class="text-xs text-white/70">Projectorlink {{ projectorKey ? 'gedeeld' : 'nog verbergen' }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="bg-slate-900/60">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium">Snelle acties</span>
            <UBadge color="violet" variant="soft">Workflow</UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <UFormGroup label="Projector link">
            <div class="flex gap-2">
              <UInput :model-value="projectorUrl || 'Nog geen sleutel'" readonly />
              <UButton color="violet" icon="i-ph-copy-duotone" :disabled="!projectorUrl" @click="copyProjectorLink" />
            </div>
          </UFormGroup>
          <USeparator />
          <UVerticalNavigation
            :links="[
              { label: 'Kalibratie openen', icon: 'i-ph-ruler-duotone', to: '/calibrate' },
              { label: 'Bekijk projector', icon: 'i-ph-projector-screen-duotone', to: projectorUrl || '/projector' },
              { label: 'Ga naar documentatie', icon: 'i-ph-book-duotone', to: 'https://github.com/Pattern-Projector/pattern-projector' },
            ]"
          />
        </div>
      </UCard>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard class="bg-slate-900/60">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm uppercase text-white/60">Actieve patronen</p>
            <p class="text-2xl font-semibold">{{ patternCount }}</p>
          </div>
          <UIcon name="i-ph-folders-duotone" class="text-3xl text-violet-400" />
        </div>
        <p class="mt-2 text-sm text-white/70">Beheer lagen, instructies en projecteer ze direct.</p>
      </UCard>
      <UCard class="bg-slate-900/60">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm uppercase text-white/60">Projector status</p>
            <p class="text-2xl font-semibold">{{ projectorStatusLabel }}</p>
          </div>
          <UIcon name="i-ph-lightning-duotone" class="text-3xl text-emerald-400" />
        </div>
        <p class="mt-2 text-sm text-white/70">{{ projectorBadgeText }}</p>
      </UCard>
      <UCard class="bg-slate-900/60">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm uppercase text-white/60">Laatste sync</p>
            <p class="text-2xl font-semibold">
              {{ projectorState?.updatedAt ? formatDate(projectorState.updatedAt) : 'Nog niet gesynchroniseerd' }}
            </p>
          </div>
          <UIcon name="i-ph-clock-duotone" class="text-3xl text-sky-400" />
        </div>
        <p class="mt-2 text-sm text-white/70">Alle wijzigingen worden automatisch doorgegeven aan de Pi.</p>
      </UCard>
    </div>

    <UCard class="bg-slate-900/60">
      <template #header>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3">
            <span class="font-medium">Patroonbibliotheek</span>
            <UBadge variant="soft" color="gray">{{ patternCount }} items</UBadge>
          </div>
          <div class="flex flex-wrap gap-3">
            <UInput
              v-model="search"
              icon="i-ph-magnifying-glass-duotone"
              placeholder="Zoek op naam"
              color="gray"
            />
            <UButton color="white" variant="soft" icon="i-ph-upload-duotone" @click="openUpload = true">
              Nieuw
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="pending" class="flex items-center gap-3 text-white/70">
        <ULoader size="lg" /> Laden...
      </div>
      <div v-else-if="!filteredPatterns.length" class="text-white/60">
        Geen patronen gevonden voor deze zoekopdracht.
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <PatternCard v-for="pattern in filteredPatterns" :key="pattern._id" :pattern="pattern" />
      </div>
    </UCard>

    <section class="grid gap-6 lg:grid-cols-[3fr,2fr]">
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
            <URange v-model="projectorControls.zoom" :min="0.25" :max="3" :step="0.05" color="violet" />
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
          <UToggle v-model="projectorControls.invertColors" label="Inverteer kleuren" :disabled="projectorSaving" />
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
  </UContainer>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { computed, reactive, ref, watch } from 'vue'
import type { PatternDocument } from '~/types/patterns'
import type { ProjectorState, ProjectorStatePayload } from '~/types/projector'

const openUpload = ref(false)
const creating = ref(false)
const search = ref('')
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

const patternCount = computed(() => patterns.value?.length ?? 0)
const filteredPatterns = computed(() => {
  const query = search.value.trim().toLowerCase()
  const list = patterns.value ?? []
  if (!query) return list
  return list.filter((pattern) => pattern.title.toLowerCase().includes(query))
})

const patternOptions = computed(() =>
  (patterns.value ?? []).map((pattern) => ({ label: pattern.title, value: pattern._id })),
)

const projectorActive = computed(() => Boolean(projectorState.value?.pattern))
const projectorStatusLabel = computed(() => (projectorActive.value ? 'Actief' : 'Idle'))
const activePatternTitle = computed(() => projectorState.value?.pattern?.title ?? 'Nog geen selectie')
const projectorBadgeText = computed(() =>
  projectorActive.value ? `Toont ${activePatternTitle.value}` : 'Selecteer een patroon om te projecteren.',
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
