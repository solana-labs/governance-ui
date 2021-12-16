import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import MembersItems from './MembersItems'

const MembersCompactWrapper = () => {
  //TODO do we want to fetch only when realm change?
  const { symbol, tokenRecords } = useRealm()
  const membersCount = Object.keys(tokenRecords).length
  const totalVotesCast = Object.keys(tokenRecords)
    .map((x) => tokenRecords[x].info.totalVotesCount)
    .reduce((prev, current) => {
      return current + prev
    }, 0)
  const { resetCompactViewState } = useMembersListStore()
  const currentView = useMembersListStore((s) => s.compact.currentView)
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
            <div style={{ maxHeight: '400px' }} className="overflow-y-auto">
              <MembersItems></MembersItems>
            </div>
          </>
        )
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
