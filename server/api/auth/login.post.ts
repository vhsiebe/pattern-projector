import { setUserSession } from '#auth'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const { email, password } = bodySchema.parse(await readBody(event))
  const runtimeConfig = useRuntimeConfig()

  const allowedPassword = runtimeConfig.authSecret || process.env.AUTH_SESSION_PASSWORD
  if (allowedPassword && password !== allowedPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Ongeldige inloggegevens' })
  }

  const normalizedEmail = email.toLowerCase()
  await setUserSession(event, {
    user: {
      id: normalizedEmail,
      email: normalizedEmail,
    },
  })

  return { ok: true }
})
