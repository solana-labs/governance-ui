import { Member } from '@utils/uiTypes/members'
import dynamic from 'next/dynamic'
const MemberItem = dynamic(() => import('./MemberItem'))

const MembersItems = ({ activeMembers }: { activeMembers: Member[] }) => {
  return (
    <div className="space-y-3">
      {activeMembers.slice(0, 5).map((x) => (
        <MemberItem item={x} key={x.walletAddress}></MemberItem>
      ))}
    </div>
  )
}
export default MembersItems
