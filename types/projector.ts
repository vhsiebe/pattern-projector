export interface ProjectorPatternSnapshot {
  id: string
  title: string
  url: string
}

export interface ProjectorState {
  patternId?: string | null
  pattern?: ProjectorPatternSnapshot | null
  zoom: number
  offsetX: number
  offsetY: number
  invertColors: boolean
  mirrorX: boolean
  mirrorY: boolean
  updatedAt: string
}

export type ProjectorStatePayload = Partial<
  Pick<ProjectorState, 'patternId' | 'zoom' | 'offsetX' | 'offsetY' | 'invertColors' | 'mirrorX' | 'mirrorY'>
>
