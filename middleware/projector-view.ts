export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/projector') {
    return
  }

  const key = typeof to.query.key === 'string' ? to.query.key : null
  if (!key && import.meta.server) {
    return
  }

  if (!key && import.meta.client) {
    return navigateTo('/auth?redirect=/projector')
  }
})
