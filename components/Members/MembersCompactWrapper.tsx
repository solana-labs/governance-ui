import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import MembersItems from './MembersItems'
import useMembers from './useMembers'
import MemberOverview from './MemberOverview'

const MembersCompactWrapper = () => {
  const { symbol } = useRealm()
  const { members } = useMembers()
  const membersCount = members.length
  const { resetCompactViewState } = useMembersListStore()
  const currentView = useMembersListStore((s) => s.compact.currentView)
  const totalVotesCast = members.reduce((prev, current) => {
    return (
      (current.council?.info.totalVotesCount || 0) +
      (current.community?.info.totalVotesCount || 0) +
      prev
    )
  }, 0)

  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">Members ({membersCount})</h3>
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
