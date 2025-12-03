import { requireUserSession } from '#auth'
import { createPattern } from '~/server/utils/patterns'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  return createPattern(session.user.id, body)
})
