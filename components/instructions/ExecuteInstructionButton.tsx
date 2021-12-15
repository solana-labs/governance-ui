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
import { ParsedAccount } from '@models/core/accounts'
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
  proposal: ParsedAccount<Proposal>
  proposalInstruction: ParsedAccount<ProposalInstruction>
  playing: PlayState
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal?.info.votingCompletedAt
    ? proposal.info.votingCompletedAt.toNumber() + 1
    : 0

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  const rpcContext = new RpcContext(
    new PublicKey(proposal.account.owner.toString()),
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
    } catch (error) {
      console.log('error executing instruction', error)

      setPlaying(PlayState.Error)

      return
    }

    setPlaying(PlayState.Played)
  }

  if (
    proposalInstruction.info.executionStatus ===
    InstructionExecutionStatus.Success
  ) {
    return (
      <Tooltip content="instruction executed successfully">
        <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
      </Tooltip>
    )
  }

  if (
    proposal.info.state !== ProposalState.Executing &&
    proposal.info.state !== ProposalState.ExecutingWithErrors &&
    proposal.info.state !== ProposalState.Succeeded
  ) {
    return null
  }

  if (ineligibleToSee) {
    return null
  }

  if (
    playing === PlayState.Unplayed &&
    proposalInstruction.info.executionStatus !==
      InstructionExecutionStatus.Error
  ) {
    return (
      <Button disabled={!connected} onClick={onExecuteInstruction}>
        Execute
      </Button>
    )
  }

  if (playing === PlayState.Playing) {
    return <PlayIcon className="h-5 ml-2 text-orange w-5" />
  }

  if (
    playing === PlayState.Error ||
    proposalInstruction.info.executionStatus ===
      InstructionExecutionStatus.Error
  ) {
    return (
      <Tooltip content="retry to execute instruction">
        <p className="border-dashed border-fgd-3 text-fgd-3 text-xs hover:cursor-help border-b-0">
          <Button disabled={!connected} onClick={onExecuteInstruction}>
            <RefreshIcon className="h-5 ml-2 text-orange w-5" />
          </Button>
        </p>
      </Tooltip>
    )
  }

  return <CheckCircleIcon className="h-5 ml-2 text-green w-5" key="played" />
}
