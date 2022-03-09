import useRealm from '@hooks/useRealm'
import React, { useEffect, useState } from 'react'
import useMembersListStore from 'stores/useMembersStore'
import { ViewState } from './types'
import MembersItems from './MembersItems'
import useMembers from './useMembers'
import MemberOverview from './MemberOverview'
import { PlusIcon } from '@heroicons/react/outline'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Tooltip from '@components/Tooltip'
import useWalletStore from 'stores/useWalletStore'
import Modal from '@components/Modal'
import AddMemberForm from './AddMemberForm'

const MembersCompactWrapper = () => {
  const {
    symbol,
    councilMint,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
  } = useRealm()
  const { members, activeMembers } = useMembers()
  const connected = useWalletStore((s) => s.connected)
  const activeMembersCount = activeMembers.length
  const { resetCompactViewState } = useMembersListStore()
  const {
    canUseMintInstruction,
    canMintRealmCouncilToken,
  } = useGovernanceAssets()
  const currentView = useMembersListStore((s) => s.compact.currentView)
  const totalVotesCast = members.reduce((prev, current) => {
    return prev + current.votesCasted
  }, 0)

  const [openAddMemberModal, setOpenAddMemberModal] = useState(false)

  const addNewMemberTooltip = !connected
    ? 'Connect your wallet to add new council member'
    : !canMintRealmCouncilToken()
    ? 'Your realm need mint governance for council token to add new member'
    : !canUseMintInstruction
    ? "You don't have enough governance power to add new council member"
    : toManyCommunityOutstandingProposalsForUser
    ? 'You have too many community outstanding proposals. You need to finalize them before creating a new council member.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'You have too many council outstanding proposals. You need to finalize them before creating a new council member.'
    : ''

  const getCurrentView = () => {
    switch (currentView) {
      case ViewState.MainView:
        return (
          <>
            <h3 className="mb-4 flex items-center">
              Members ({activeMembersCount})
              {councilMint && (
                <Tooltip
                  contentClassName="ml-auto"
                  content={addNewMemberTooltip}
                >
                  <div
                    onClick={() => setOpenAddMemberModal(!openAddMemberModal)}
                    className={`bg-bkg-2 default-transition 
                flex flex-col items-center justify-center
                rounded-lg hover:bg-bkg-3 ml-auto 
                hover:cursor-pointer ${
                  addNewMemberTooltip ? 'opacity-60 pointer-events-none' : ''
                }`}
                  >
                    <div className="bg-[rgba(255,255,255,0.06)] h-6 w-6 flex font-bold items-center justify-center rounded-full text-fgd-3">
                      <PlusIcon />
                    </div>
                  </div>
                </Tooltip>
              )}
            </h3>

            <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
              <p className="text-fgd-3 text-xs">Total votes cast</p>

              <h3 className="mb-0">{totalVotesCast}</h3>
            </div>

            <div>
              <MembersItems activeMembers={activeMembers} />
            </div>

            {openAddMemberModal && (
              <Modal
                background="bg-bkg-1 md:mt-0 mt-8"
                sizeClassName="sm:max-w-3xl"
                onClose={() => setOpenAddMemberModal(false)}
                isOpen={openAddMemberModal}
              >
                <AddMemberForm close={() => setOpenAddMemberModal(false)} />
              </Modal>
            )}
          </>
        )
      case ViewState.MemberOverview:
        return <MemberOverview />
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
