import { getUserSession } from '#auth'
import { getProjectorState } from '~/server/utils/projector'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const session = await getUserSession(event)
  const query = getQuery(event)
  const providedKey = (query.key as string | undefined) ?? getHeader(event, 'x-projector-key')
  const hasSession = Boolean(session?.user)
  const hasKeyAccess = Boolean(runtimeConfig.projectorKey && providedKey === runtimeConfig.projectorKey)

  if (!hasSession && !hasKeyAccess) {
    throw createError({ statusCode: 401, statusMessage: 'Projectorscherm vereist sleutel of login' })
  }

  const state = await getProjectorState()

  if (hasSession && runtimeConfig.projectorKey) {
    return { ...state, projectorKey: runtimeConfig.projectorKey }
  }

  return state
})
