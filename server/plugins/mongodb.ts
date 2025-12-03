import { MongoClient } from 'mongodb'

declare global {
  var _mongoClient: MongoClient | undefined
}

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    console.warn('⚠️  Geen MONGODB_URI ingesteld, MongoDB wordt overgeslagen.')
    return
  }

  if (!global._mongoClient) {
    const client = new MongoClient(config.mongodbUri)
    await client.connect()
    global._mongoClient = client
    nitroApp.hooks.hook('close', async () => {
      await client.close()
    })
  }
})

export const getMongoClient = () => {
  if (!global._mongoClient) {
    throw new Error('MongoDB client is niet geïnitialiseerd')
  }

  return global._mongoClient
}
