import useRealm from '@hooks/useRealm'
import React, { useEffect } from 'react'
import useMembersListStore from 'stores/useMembersListStore'
import { ViewState } from './types'
import MembersItems from './MembersItems'

const MembersCompactWrapper = () => {
  //TODO do we want to fetch only when realm change?
  const { symbol } = useRealm()
  const { resetCompactViewState } = useMembersListStore()
  const currentView = useMembersListStore((s) => s.compact.currentView)
  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">Members</h3>
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
