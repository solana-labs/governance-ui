import { EndpointTypes } from '@models/types'

export interface EndpointInfo {
  name: EndpointTypes
  url: string
}

export type GovernanceRole = 'council' | 'community';