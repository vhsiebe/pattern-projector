import { z } from 'zod'
import type { ProjectorState, ProjectorStatePayload, ProjectorPatternSnapshot } from '~/types/projector'
import { getMongoClient } from '../plugins/mongodb'
import { findPatternById } from './patterns'

const PROJECTOR_STATE_ID = 'global-projector'

const projectorSchema = z.object({
  patternId: z.string().min(1).optional().nullable(),
  zoom: z.number().min(0.1).max(5).optional(),
  offsetX: z.number().min(-2000).max(2000).optional(),
  offsetY: z.number().min(-2000).max(2000).optional(),
  invertColors: z.boolean().optional(),
  mirrorX: z.boolean().optional(),
  mirrorY: z.boolean().optional(),
})

const defaultState: ProjectorState = {
  patternId: null,
  pattern: null,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  invertColors: false,
  mirrorX: false,
  mirrorY: false,
  updatedAt: new Date(0).toISOString(),
}

type ProjectorStateDb = Omit<ProjectorState, 'updatedAt'> & {
  _id: string
  updatedAt: Date
}

const toState = (doc?: ProjectorStateDb | null): ProjectorState => {
  if (!doc) {
    return defaultState
  }
  return {
    patternId: doc.patternId ?? null,
    pattern: doc.pattern ?? null,
    zoom: doc.zoom,
    offsetX: doc.offsetX,
    offsetY: doc.offsetY,
    invertColors: doc.invertColors,
    mirrorX: doc.mirrorX,
    mirrorY: doc.mirrorY,
    updatedAt: doc.updatedAt.toISOString(),
  }
}

const getCollection = () => getMongoClient().db().collection<ProjectorStateDb>('projector_state')

export const getProjectorState = async () => {
  const collection = getCollection()
  const doc = await collection.findOne({ _id: PROJECTOR_STATE_ID })
  if (!doc) {
    const seed: ProjectorStateDb = { ...defaultState, _id: PROJECTOR_STATE_ID, updatedAt: new Date() }
    await collection.insertOne(seed)
    return toState(seed)
  }
  return toState(doc)
}

export const updateProjectorState = async (ownerId: string, payload: ProjectorStatePayload) => {
  const collection = getCollection()
  const parsed = projectorSchema.partial().parse(payload)
  let patternSnapshot: ProjectorPatternSnapshot | null | undefined

  if (Object.prototype.hasOwnProperty.call(parsed, 'patternId')) {
    if (!parsed.patternId) {
      patternSnapshot = null
    } else {
      const pattern = await findPatternById(ownerId, parsed.patternId)
      if (!pattern) {
        throw createError({ statusCode: 404, statusMessage: 'Patroon niet gevonden' })
      }
      patternSnapshot = { id: pattern._id, title: pattern.title, url: pattern.url }
    }
  }

  const updatePayload: Record<string, unknown> = {
    ...parsed,
    updatedAt: new Date(),
  }

  if (patternSnapshot !== undefined) {
    updatePayload.pattern = patternSnapshot
  }

  await collection.updateOne(
    { _id: PROJECTOR_STATE_ID },
    { $set: updatePayload },
    { upsert: true },
  )

  const latest = await collection.findOne({ _id: PROJECTOR_STATE_ID })
  return toState(latest)
}
