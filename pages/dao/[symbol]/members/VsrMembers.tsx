import MemberOverview from "@components/Members/MemberOverview"
import MembersTabs from "@components/Members/MembersTabs"
import { SearchIcon, UsersIcon } from "@heroicons/react/solid"
import { useTokenOwnerRecordsForRealmQuery } from "@hooks/queries/tokenOwnerRecord"
import Input from '@components/inputs/Input'
import { Member } from "@utils/uiTypes/members"
import { BN } from "bn.js"
import { useEffect, useMemo, useRef, useState } from "react"
import Select from '@components/inputs/Select'
import PaginationComponent from '@components/Pagination'
import useRealm from "@hooks/useRealm"
import PreviousRouteBtn from "@components/PreviousRouteBtn"


function VsrMembers({
  councilMode, councilOnly, setCouncilMode
} : {
  councilMode: boolean,
  councilOnly: boolean,
  setCouncilMode: (b: boolean) => void
}) {
  const {
    realmInfo,
  } = useRealm()

  const pagination = useRef<{ setPage: (val) => void }>(null)
  const membersPerPage = 10

  const [searchString, setSearchString] = useState('')
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [activeMember, setActiveMember] = useState<Member>()
  const [paginatedMembers, setPaginatedMembers] = useState<Member[]>([])

  const {data: vsrMembersData} = useTokenOwnerRecordsForRealmQuery()
  const activeMembers: Member[] | undefined = useMemo(() => (
    vsrMembersData?.map(
      member => ({
        walletAddress: member.account.governingTokenOwner.toBase58(),
        communityVotes: new BN(0),
        councilVotes: new BN(0)
      })
    )
  ), [vsrMembersData]) 

  const filterMembers = (v) => {
    if (activeMembers !== undefined) {
      setSearchString(v)
      if (v.length > 0) {
        const filtered = activeMembers.filter((r) =>
          r.walletAddress?.toLowerCase().includes(v.toLowerCase())
        )
        setFilteredMembers(filtered)
      } else {
        setFilteredMembers(activeMembers)
      }
    }
  }

  const onPageChange = (page) => {
    setPaginatedMembers(paginateMembers(page))
  }
  const paginateMembers = (page) => {
    return filteredMembers.slice(
      page * membersPerPage,
      (page + 1) * membersPerPage
    )
  }

  useEffect(() => {
    if (activeMembers && activeMembers.length > 0) {
      setActiveMember(activeMembers[0])
      setFilteredMembers(activeMembers)
    }
  }, [activeMembers])
  
  useEffect(() => {
    setPaginatedMembers(paginateMembers(0))
    pagination?.current?.setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(filteredMembers)])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <div className="mb-4">
          <PreviousRouteBtn />
        </div>
        <div className="border-b border-fgd-4 flex flex-col md:flex-row justify-between pb-4">
          <div className="flex items-center mb-2 md:mb-0 py-2">
            {realmInfo?.ogImage ? (
              <img src={realmInfo?.ogImage} className="h-8 mr-3 w-8"></img>
            ) : null}
            <div>
              <p>{realmInfo?.displayName}</p>
              <h1 className="mb-0">{
                councilOnly && councilMode ? 'Council ' :
                councilOnly ? 'All' : ''
                } Members
              </h1>
            </div>
            {councilOnly &&
              <div 
                className="mt-6 ml-4 text-md underline cursor-pointer" 
                onClick={() => setCouncilMode(!councilMode)}
              >
                {councilMode ? 'All' : 'Council'} Members
              </div>
            }
          </div>
      <div className="flex space-x-3">
              <div className="bg-bkg-1 px-4 py-2 rounded-md w-full">
                <div className="flex items-center">
                  <UsersIcon className="flex-shrink-0 h-8 mr-2 text-primary-light w-8" />
                  <div>
                    <p>Members</p>
                    {activeMembers !== undefined && (
                      <div className="font-bold text-fgd-1 text-2xl">
                        {activeMembers.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          {activeMembers !== undefined && activeMembers.length > 15 ? (
            <div className="hidden lg:block mb-2">
              <Input
                className="pl-8"
                value={searchString}
                type="text"
                onChange={(e) => filterMembers(e.target.value)}
                placeholder={`Search by Wallet Address...`}
                prefix={<SearchIcon className="h-5 w-5 text-fgd-3" />}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between py-3">
            <p>
              {searchString.length > 0
                ? `${filteredMembers.length} Members Found`
                : `${activeMembers ? activeMembers.length : ''} Members`}
            </p>
          </div>
          <div className="col-span-12 lg:hidden">
            <Select
              className="break-all"
              onChange={(v) =>
                setActiveMember(
                  // @ts-ignore
                  activeMembers.find((m) => {
                    return m.walletAddress === v
                  })
                )
              }
              placeholder="Please select..."
              value={activeMember?.walletAddress}
            >
              {activeMembers?.map((x) => {
                return (
                  <Select.Option
                    key={x?.walletAddress}
                    value={x?.walletAddress}
                  >
                    {x?.walletAddress}
                  </Select.Option>
                )
              })}
            </Select>
          </div>
          <div className="hidden lg:block">
            {activeMember !== undefined && (
              <MembersTabs
                activeTab={activeMember}
                onChange={(t) => setActiveMember(t)}
                tabs={paginatedMembers}
                vsrMode={true}
              />
            )}
            <PaginationComponent
              ref={pagination}
              totalPages={Math.ceil(filteredMembers.length / 10)}
              onPageChange={onPageChange}
            ></PaginationComponent>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
          {activeMember ? (
            <MemberOverview
              member={activeMember}
              activeMembers={activeMembers}
              vsrDisplay={true}
            />
          ) : null}
        </div>
      </div>
  )
}

export default VsrMembers