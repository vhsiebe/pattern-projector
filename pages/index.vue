<template>
  <section class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
    <div class="grid gap-10 lg:grid-cols-2">
      <div class="space-y-6">
        <UBadge color="violet" variant="soft">Nuxt 3 + MongoDB</UBadge>
        <h1 class="text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Projecteer patronen met realtime kalibratie en cloud-synchronisatie.
        </h1>
        <p class="text-lg text-white/70">
          Deze nieuwe Nuxt-versie van Pattern Projector bundelt Nuxt UI, Tailwind en MongoDB
          zodat makers snel patronen kunnen uploaden, kalibreren en delen. Alles draait op
          serverless Nitro endpoints en maakt gebruik van nuxt-auth-utils voor sessiebeheer.
        </p>
        <div class="flex flex-wrap gap-4">
          <UButton to="/dashboard" size="lg" icon="i-ph-layout-duotone" label="Open dashboard" />
          <UButton to="/auth" size="lg" color="white" variant="outline" label="Login" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <UCard>
            <div class="text-3xl font-semibold text-white">0.5mm</div>
            <p class="text-sm text-white/60">Kalibratie-nauwkeurigheid dankzij canvas rendering.</p>
          </UCard>
          <UCard>
            <div class="text-3xl font-semibold text-white">24/7</div>
            <p class="text-sm text-white/60">MongoDB Atlas synchroniseert lagen op elk device.</p>
          </UCard>
        </div>
      </div>
      <UCard class="bg-gradient-to-br from-violet-600/40 to-indigo-700/40">
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold">Projector pipeline</h2>
          <ol class="space-y-3 text-white/80">
            <li class="flex items-start gap-3">
              <UIcon name="i-ph-upload-duotone" class="mt-1" />
              Upload een PDF-patroon en laat de server de lagen analyseren.
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-ph-ruler-duotone" class="mt-1" />
              Gebruik de kalibratietool in Nuxt UI om de projectie bij te stellen.
            </li>
            <li class="flex items-start gap-3">
              <UIcon name="i-ph-share-network-duotone" class="mt-1" />
              Deel instellingen via MongoDB en nodig teamleden uit.
            </li>
          </ol>
        </div>
      </UCard>
    </div>
    <section class="grid gap-6 lg:grid-cols-3">
      <FeatureCard
        icon="i-ph-lightning-duotone"
        title="Realtime"
        description="Nuxt server actions en composables zorgen voor directe updates wanneer patronen aangepast worden."
      />
      <FeatureCard
        icon="i-ph-lock-duotone"
        title="Veilige sessies"
        description="nuxt-auth-utils bouwt versleutelde cookies met middleware die ongeautoriseerde toegang blokkeert."
      />
      <FeatureCard
        icon="i-ph-leaf-duotone"
        title="Headless"
        description="MongoDB backend en modulair services-laag maken deployment op Edge en serverless eenvoudig."
      />
    </section>
  </section>
</template>

