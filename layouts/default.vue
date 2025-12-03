<template>
  <div>
    <header class="border-b border-white/10 bg-slate-900/70 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <UIcon name="i-ph-projector-screen-duotone" size="24" />
            Pattern Projector
          </NuxtLink>
          <UBadge color="violet" variant="solid">Nuxt</UBadge>
        </div>
        <nav class="hidden items-center gap-4 text-sm font-medium md:flex">
          <NuxtLink to="/" class="hover:text-white">Home</NuxtLink>
          <NuxtLink to="/dashboard" class="hover:text-white">Dashboard</NuxtLink>
          <NuxtLink to="/calibrate" class="hover:text-white">Calibrate</NuxtLink>
        </nav>
        <div class="flex items-center gap-3">
          <UButton
            v-if="session"
            color="primary"
            variant="soft"
            icon="i-ph-user-circle-duotone"
            :label="session.user?.email ?? 'Account'"
            to="/dashboard"
          />
          <UButton
            v-else
            to="/auth"
            color="white"
            variant="solid"
            label="Aanmelden"
          />
        </div>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="border-t border-white/10 bg-slate-950/70">
      <div class="mx-auto max-w-6xl px-6 py-6 text-sm text-white/60">
        Gemaakt met Nuxt UI, Tailwind CSS en MongoDB.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { session } = useUserSession()
</script>
