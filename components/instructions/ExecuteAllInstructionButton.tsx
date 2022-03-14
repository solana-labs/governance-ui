import React, { useEffect, useState } from 'react'
import {
  InstructionExecutionStatus,
  ProgramAccount,
  Proposal,
  ProposalState,
  ProposalTransaction,
  RpcContext,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { executeInstructions } from 'actions/executeInstructions'
import useWalletStore from 'stores/useWalletStore'
import { notify } from '@utils/notifications'

export enum PlayState {
  Played,
  Unplayed,
  Playing,
  Error,
}

export function ExecuteAllInstructionButton({
  proposal,
  playing,
  setPlaying,
  proposalInstructions,
}: {
  proposal: ProgramAccount<Proposal>
  proposalInstructions: ProgramAccount<ProposalTransaction>[]
  playing: PlayState
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const connected = useWalletStore((s) => s.connected)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal?.account.votingCompletedAt
    ? proposal.account.votingCompletedAt.toNumber() + 1
    : 0

  const isPassedExecutionSlot = currentSlot - canExecuteAt >= 0

  const rpcContext = new RpcContext(
    new PublicKey(proposal.owner.toString()),
    getProgramVersionForRealm(realmInfo!),
    wallet!,
    connection.current,
    connection.endpoint
  )
  // update the current slot every 5 seconds
  // if current slot > slot available to execute the transaction
  useEffect(() => {
    if (isPassedExecutionSlot && proposal) {
      const timer = setTimeout(() => {
        rpcContext.connection.getSlot().then(setCurrentSlot)
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isPassedExecutionSlot, rpcContext.connection, currentSlot])

  const onExecuteInstructions = async () => {
    setPlaying(PlayState.Playing)

    try {
      await executeInstructions(rpcContext, proposal, proposalInstructions)
      await fetchRealm(realmInfo?.programId, realmInfo?.realmId)
    } catch (error) {
      notify({ type: 'error', message: `error executing instruction ${error}` })
      console.error('error executing instruction', error)

      setPlaying(PlayState.Error)

      return
    }

    setPlaying(PlayState.Played)
  }

  if (
    ![
      ProposalState.Executing,
      ProposalState.ExecutingWithErrors,
      ProposalState.Succeeded,
    ].includes(proposal.account.state)
  ) {
    return null
  }

  if (isPassedExecutionSlot) {
    return null
  }

  if (
    playing === PlayState.Unplayed &&
    proposalInstructions.every(
      (itx) => itx.account.executionStatus !== InstructionExecutionStatus.Error
    )
  ) {
    return (
      <Button small disabled={!connected} onClick={onExecuteInstructions}>
        Execute All
      </Button>
    )
  }

  if (playing === PlayState.Playing) {
    return <PlayIcon className="h-5 ml-2 text-orange w-5" />
  }

  if (
    playing === PlayState.Error ||
    proposalInstructions.every(
      (itx) => itx.account.executionStatus !== InstructionExecutionStatus.Error
    )
  ) {
    return (
      <Tooltip content="retry to execute instruction">
        <RefreshIcon
          onClick={onExecuteInstructions}
          className="h-5 ml-2 text-orange w-5"
        />
      </Tooltip>
    )
  }

  return <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
}
