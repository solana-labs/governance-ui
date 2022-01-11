import { useEffect, useState } from 'react'
import { executeInstruction } from 'actions/executeInstruction'
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalInstruction,
  ProposalState,
} from '@models/accounts'
import React from 'react'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import { RpcContext } from '@models/core/api'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { ProgramAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Tooltip from '@components/Tooltip'

export enum PlayState {
  Played,
  Unplayed,
  Playing,
  Error,
}

export function ExecuteInstructionButton({
  proposal,
  playing,
  setPlaying,
  proposalInstruction,
}: {
  proposal: ProgramAccount<Proposal>
  proposalInstruction: ProgramAccount<ProposalInstruction>
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

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  const rpcContext = new RpcContext(
    new PublicKey(proposal.owner.toString()),
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  useEffect(() => {
    if (ineligibleToSee && proposal) {
      const timer = setTimeout(() => {
        rpcContext.connection.getSlot().then(setCurrentSlot)
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [ineligibleToSee, rpcContext.connection, currentSlot])

  const onExecuteInstruction = async () => {
    setPlaying(PlayState.Playing)

    try {
      await executeInstruction(rpcContext, proposal, proposalInstruction)
      await fetchRealm(realmInfo?.programId, realmInfo?.realmId)
    } catch (error) {
      console.log('error executing instruction', error)

      setPlaying(PlayState.Error)

      return
    }

    setPlaying(PlayState.Played)
  }

  if (
    proposalInstruction.account.executionStatus ===
    InstructionExecutionStatus.Success
  ) {
    return (
      <Tooltip content="instruction executed successfully">
        <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
      </Tooltip>
    )
  }

  if (
    proposal.account.state !== ProposalState.Executing &&
    proposal.account.state !== ProposalState.ExecutingWithErrors &&
    proposal.account.state !== ProposalState.Succeeded
  ) {
    return null
  }

  if (ineligibleToSee) {
    return null
  }

  if (
    playing === PlayState.Unplayed &&
    proposalInstruction.account.executionStatus !==
      InstructionExecutionStatus.Error
  ) {
    return (
      <Button small disabled={!connected} onClick={onExecuteInstruction}>
        Execute
      </Button>
    )
  }

  if (playing === PlayState.Playing) {
    return <PlayIcon className="h-5 ml-2 text-orange w-5" />
  }

  if (
    playing === PlayState.Error ||
    proposalInstruction.account.executionStatus ===
      InstructionExecutionStatus.Error
  ) {
    return (
      <Tooltip content="retry to execute instruction">
        <RefreshIcon
          onClick={onExecuteInstruction}
          className="h-5 ml-2 text-orange w-5"
        />
      </Tooltip>
    )
  }

  return <CheckCircleIcon className="h-5 ml-2 text-green w-5" key="played" />
}
