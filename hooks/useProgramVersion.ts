import useSelectedRealmPubkey from './selectedRealm/useSelectedRealmPubkey'
import { useProgramVersionByIdQuery } from './queries/useProgramVersionQuery'

const useProgramVersion = () => {
  const realm = useSelectedRealmPubkey()
  const queriedVersion = useProgramVersionByIdQuery(realm).data as
    | 1
    | 2
    | 3
    | undefined
  return queriedVersion
}

export default useProgramVersion
