import useRealm from '@hooks/useRealm'
import MemberItem from './MemberItem'
import { TokenRecordWithWallet } from './types'

const MembersItems = () => {
  //TODO do we want to fetch only when realm change?
  const { tokenRecords } = useRealm()
  const tokenRecordArray: TokenRecordWithWallet[] = Object.keys(
    tokenRecords
  ).flatMap((x) => {
    return {
      walletAddress: x,
      ...tokenRecords[x],
    }
  })
  return (
    <div>
      {tokenRecordArray.map((x) => (
        <MemberItem item={x} key={x.walletAddress}></MemberItem>
      ))}
    </div>
  )
}
export default MembersItems
