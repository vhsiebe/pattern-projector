export interface PatternDocument {
  _id: string
  title: string
  description?: string
  url: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface PatternPayload {
  title: string
  description?: string
  url: string
}
