import { useProgramVersionByIdQuery } from './queries/useProgramVersionQuery'
import { useRealmQuery } from './queries/realm'

const useProgramVersion = () => {
  const realm = useRealmQuery().data?.result
  const queriedVersion = useProgramVersionByIdQuery(realm?.owner).data as
    | 1
    | 2
    | 3
    | undefined
  return queriedVersion
}

export default useProgramVersion
