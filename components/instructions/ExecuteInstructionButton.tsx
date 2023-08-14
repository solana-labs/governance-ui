import { useEffect, useState } from 'react'
import { executeTransaction } from 'actions/executeTransaction'
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalTransaction,
  ProposalState,
} from '@solana/spl-governance'
import React from 'react'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import { RpcContext } from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import { ProgramAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Tooltip from '@components/Tooltip'
import { getProgramVersionForRealm } from '@models/registry/api'
import { notify } from '@utils/notifications'
import dayjs from 'dayjs'
import { getFormattedStringFromDays, SECS_PER_DAY } from '@utils/dateTools'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import queryClient from '@hooks/queries/queryClient'
import { proposalQueryKeys } from '@hooks/queries/proposal'

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
  proposalInstruction: ProgramAccount<ProposalTransaction>
  playing: PlayState
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected

  const [currentSlot, setCurrentSlot] = useState(0)

  const canExecuteAt = proposal?.account.votingCompletedAt
    ? proposal.account.votingCompletedAt.toNumber() + 1
    : 0

  const ineligibleToSee = currentSlot - canExecuteAt >= 0

  const rpcContext = new RpcContext(
    new PublicKey(proposal.owner.toString()),
    getProgramVersionForRealm(realmInfo!),
    wallet!,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [ineligibleToSee, rpcContext.connection, currentSlot])

  const onExecuteInstruction = async () => {
    setPlaying(PlayState.Playing)

    try {
      await executeTransaction(rpcContext, proposal, proposalInstruction)
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (error) {
      notify({ type: 'error', message: `error executing instruction ${error}` })
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
    const timeLeftToExectue =
      (proposal.account.votingCompletedAt &&
        dayjs
          .unix(proposal.account.votingCompletedAt.toNumber())
          .add(proposalInstruction.account.holdUpTime, 'second')
          .unix() - dayjs().unix()) ||
      0
    return timeLeftToExectue > 0 ? (
      <Button small disabled={true} onClick={onExecuteInstruction}>
        Can execute in{' '}
        {getFormattedStringFromDays(timeLeftToExectue / SECS_PER_DAY)}
      </Button>
    ) : (
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
