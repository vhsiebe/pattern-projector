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
import { reactive, ref } from 'vue'
import type { PatternDocument } from '~/types/patterns'

const openUpload = ref(false)
const creating = ref(false)
const form = reactive({ title: '', description: '', url: '' })

const {
  data: patterns,
  pending,
  refresh,
} = await useAsyncData<PatternDocument[]>('patterns', () => $fetch('/api/patterns'))

const toast = useToast()

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
