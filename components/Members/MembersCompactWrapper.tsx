import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import MembersItems from './MembersItems'
import useMembers from './useMembers'
import MemberOverview from './MemberOverview'
import { PlusIcon } from '@heroicons/react/outline'
import AddMember from './AddMember'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

const MembersCompactWrapper = () => {
  const { symbol, mint, councilMint } = useRealm()
  const { members } = useMembers()
  const membersCount = members.length
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const { canUseMintInstruction } = useGovernanceAssets()
  const currentView = useMembersListStore((s) => s.compact.currentView)
  const totalVotesCast = members.reduce((prev, current) => {
    const councilTotalVotes = current.council?.info.totalVotesCount || 0
    const communityTotalVotes = current.community?.info.totalVotesCount || 0
    return councilTotalVotes + communityTotalVotes + prev
  }, 0)
  const goToAddMemberView = () => {
    setCurrentCompactView(ViewState.AddMember)
  }
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">
              Members ({membersCount})
              {(mint || councilMint) && (
                <div
                  onClick={goToAddMemberView}
                  className={`bg-bkg-2 default-transition 
                flex flex-col items-center justify-center
                rounded-lg hover:bg-bkg-3 ml-auto 
                hover:cursor-pointer`}
                >
                  <div
                    className="bg-[rgba(255,255,255,0.06)] h-6 w-6 flex 
                font-bold items-center justify-center 
                rounded-full text-fgd-3"
                  >
                    <PlusIcon />
                  </div>
                </div>
              )}
            </h3>
            <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
              <p className="text-fgd-3 text-xs">Total votes cast</p>
              <h3 className="mb-0">{totalVotesCast}</h3>
            </div>
            <div style={{ maxHeight: '350px' }}>
              <MembersItems></MembersItems>
            </div>
          </>
        )
      case ViewState.MemberOverview:
        return <MemberOverview></MemberOverview>
      case ViewState.AddMember:
        return <AddMember></AddMember>
    }
  }
  useEffect(() => {
    resetCompactViewState()
  }, [symbol])
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">{getCurrentView()}</div>
  )
}

export default MembersCompactWrapper
