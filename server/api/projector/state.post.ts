import { requireUserSession } from '#auth'
import type { ProjectorStatePayload } from '~/types/projector'
import { updateProjectorState } from '~/server/utils/projector'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = (await readBody(event)) as ProjectorStatePayload
  return updateProjectorState(session.user.id, body)
})
