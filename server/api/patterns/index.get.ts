import { requireUserSession } from '#auth'
import { listPatterns } from '~/server/utils/patterns'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  return listPatterns(session.user.id)
})
