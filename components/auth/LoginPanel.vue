<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <UFormGroup label="E-mailadres" required>
      <UInput v-model="credentials.email" type="email" placeholder="patroon@studio.com" />
    </UFormGroup>
    <UFormGroup label="Wachtwoord" required>
      <UInput v-model="credentials.password" type="password" placeholder="********" />
    </UFormGroup>
    <UButton block type="submit" :loading="pending" label="Inloggen" icon="i-ph-arrow-right" />
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const toast = useToast()
const credentials = reactive({ email: '', password: '' })
const pending = ref(false)

const onSubmit = async () => {
  pending.value = true
  try {
    const { error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    if (error.value) {
      throw new Error(error.value.message)
    }
    await refreshNuxtData()
    await navigateTo('/dashboard')
    toast.add({ title: 'Welkom terug!', color: 'violet' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kon niet inloggen'
    toast.add({ title: 'Authenticatie mislukt', description: message, color: 'red' })
  } finally {
    pending.value = false
  }
}
</script>
