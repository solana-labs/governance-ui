import { getCertifiedRealmInfos } from '@models/registry/api'
import { getConnectionContext } from '@utils/connection'

export function getAllSplGovernanceProgramIds(cluster = 'mainnet') {
  return [
    ...new Set(
      getCertifiedRealmInfos(getConnectionContext(cluster)).map((info) =>
        info.programId.toBase58()
      )
    ),
  ]
}
