import { ObjectId, type Collection, type WithId } from 'mongodb'
import { z } from 'zod'
import type { PatternDocument, PatternPayload } from '~/types/patterns'
import { getMongoClient } from '../plugins/mongodb'

const patternSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional().default(''),
  url: z.string().url(),
})

type PatternDbDoc = PatternPayload & {
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

const toDocument = (doc: WithId<PatternDbDoc>): PatternDocument => ({
  _id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  url: doc.url,
  ownerId: doc.ownerId,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
})

const getCollection = (): Collection<PatternDbDoc> => getMongoClient().db().collection('patterns')

export const listPatterns = async (ownerId: string) => {
  const items = await getCollection().find({ ownerId }).sort({ createdAt: -1 }).toArray()
  return items.map(toDocument)
}

export const createPattern = async (ownerId: string, payload: PatternPayload) => {
  const data = patternSchema.parse(payload)
  const now = new Date()
  const document: PatternDbDoc = {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  }
  const { insertedId } = await getCollection().insertOne(document)
  return toDocument({ ...document, _id: insertedId })
}

export const updatePattern = async (ownerId: string, id: string, payload: Partial<PatternPayload>) => {
  const data = patternSchema.partial().parse(payload)
  const result = await getCollection().findOneAndUpdate(
    { _id: new ObjectId(id), ownerId },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Patroon niet gevonden' })
  }
  return toDocument(result)
}
