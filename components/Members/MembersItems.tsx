import PaginationComponent from '@components/Pagination'
import { Member } from '@utils/uiTypes/members'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
const MemberItem = dynamic(() => import('./MemberItem'))

const MembersItems = ({ activeMembers }: { activeMembers: Member[] }) => {
  const perPage = 7
  const [members, setMembers] = useState<Member[]>([])
  const totalPages = Math.ceil(activeMembers.length / perPage)
  const onPageChange = (page) => {
    setMembers(paginateMembers(page))
  }
  const paginateMembers = (page) => {
    return activeMembers.slice(page * perPage, (page + 1) * perPage)
  }
  useEffect(() => {
    setMembers(paginateMembers(0))
  }, [activeMembers.length])

  return (
    <>
      <div className="space-y-3 overflow-auto" style={{ maxHeight: 350 }}>
        {members.map((x) => (
          <MemberItem item={x} key={x.walletAddress}></MemberItem>
        ))}
      </div>
      <div>
        <PaginationComponent
          totalPages={totalPages}
          onPageChange={onPageChange}
        ></PaginationComponent>
      </div>
    </>
  )
}
export default MembersItems
