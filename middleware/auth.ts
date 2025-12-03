export default defineNuxtRouteMiddleware(async (to) => {
  const { session, fetch } = useUserSession()

  if (!session.value) {
    await fetch()
  }

  if (!session.value?.user) {
    return navigateTo({ path: '/auth', query: { redirect: to.path } })
  }
})
