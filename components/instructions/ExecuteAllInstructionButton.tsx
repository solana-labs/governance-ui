import React, { useEffect, useState } from 'react'
import {
  InstructionExecutionStatus,
  ProgramAccount,
  Proposal,
  ProposalState,
  ProposalTransaction,
  RpcContext,
  getNativeTreasuryAddress,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { executeInstructions } from 'actions/executeInstructions'
import { notify } from '@utils/notifications'
import { abbreviateAddress } from '@utils/formatting'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import queryClient from '@hooks/queries/queryClient'
import { proposalQueryKeys } from '@hooks/queries/proposal'

export enum PlayState {
  Played,
  Unplayed,
  Playing,
  Error,
}

const useSignersNeeded = (
  proposalInstructions: ProgramAccount<ProposalTransaction>[],
  proposal: ProgramAccount<Proposal>
) => {
  const realm = useRealmQuery().data?.result
  const [signersNeeded, setSignersNeeded] = useState<PublicKey[]>()

  const governance = proposal.account.governance

  useEffect(() => {
    const handleGetSigners = async () => {
      if (realm?.owner === undefined) return undefined

      const propInstructions = Object.values(proposalInstructions) || []

      const treasury = await getNativeTreasuryAddress(realm.owner, governance)

      //we need to remove the governance and its treasury from the signers
      const signers = propInstructions
        .map((x) => x.account.instructions.flatMap((inst) => inst.accounts))
        .filter((x) => x)
        .flatMap((x) => x)
        .filter((x) => x.isSigner)
        .map((x) => x.pubkey)
        .filter((x) => !x.equals(governance) && !x.equals(treasury))

      setSignersNeeded(signers)
    }
    handleGetSigners()
  }, [governance, proposalInstructions, realm?.owner])

  return signersNeeded
}

export function ExecuteAllInstructionButton({
  className,
  proposal,
  playing,
  setPlaying,
  proposalInstructions,
  small,
  multiTransactionMode = false,
  label = 'Execute',
}: {
  className?: string
  proposal: ProgramAccount<Proposal>
  proposalInstructions: ProgramAccount<ProposalTransaction>[]
  playing: PlayState
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>
  small?: boolean
  multiTransactionMode?: boolean
  label?: string
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [isPassedExecutionSlot, rpcContext.connection, currentSlot])

  const signersNeeded = useSignersNeeded(proposalInstructions, proposal)

  const otherSignerNeeded =
    signersNeeded === undefined
      ? undefined
      : signersNeeded.filter(
          (x) => !wallet?.publicKey || !x.equals(wallet?.publicKey)
        ).length > 0

  const onExecuteInstructions = async () => {
    setPlaying(PlayState.Playing)

    try {
      await executeInstructions(
        rpcContext,
        proposal,
        proposalInstructions,
        multiTransactionMode
      )
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
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
      <Button
        className={className}
        small={small ?? true}
        disabled={!connected || otherSignerNeeded}
        onClick={onExecuteInstructions}
        tooltipMessage={
          otherSignerNeeded && signersNeeded !== undefined
            ? `This proposal must be executed by ${abbreviateAddress(
                signersNeeded[0]
              )}`
            : undefined
        }
      >
        {label}
        {proposalInstructions.length > 1
          ? ` (${proposalInstructions.length})`
          : ''}
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
