import { getCertifiedRealmInfos } from '@models/registry/api'
import { getConnectionContext } from '@utils/connection'

export function getAllSplGovernanceProgramIds() {
  return [
    ...new Set(
      getCertifiedRealmInfos(getConnectionContext('mainnet')).map((info) =>
        info.programId.toBase58()
      )
    ),
  ]
}
