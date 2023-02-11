import React, { useEffect, useMemo, useState } from 'react'
import {
  InstructionExecutionStatus,
  ProgramAccount,
  Proposal,
  ProposalState,
  ProposalTransaction,
  RpcContext,
  withExecuteTransaction,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useRealm from '@hooks/useRealm'
import { getProgramVersionForRealm } from '@models/registry/api'
import { executeInstructions } from 'actions/executeInstructions'
import useWalletStore from 'stores/useWalletStore'
import { notify } from '@utils/notifications'
import useProgramVersion from '@hooks/useProgramVersion'
import { abbreviateAddress } from '@utils/formatting'

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
  const { realm } = useRealm()
  const programVersion = useProgramVersion()

  const [signersNeeded, setSignersNeeded] = useState<PublicKey[]>()

  useEffect(() => {
    const x = async () => {
      console.log('i ran the check')

      if (realm?.owner === undefined) return undefined

      const executionInstructions: TransactionInstruction[] = []

      await Promise.all(
        proposalInstructions.map((instruction) =>
          // withExecuteTransaction function mutates 'executionInstructions'
          withExecuteTransaction(
            executionInstructions,
            realm.owner,
            programVersion,
            proposal.account.governance,
            proposal.pubkey,
            instruction.pubkey,
            [instruction.account.getSingleInstruction()]
          )
        )
      )

      const signers = executionInstructions
        .flatMap((x) => x.keys)
        .filter((x) => x.isSigner)
        .map((x) => x.pubkey)
      setSignersNeeded(signers)
    }
    x()
  }, [
    programVersion,
    proposal.account.governance,
    proposal.pubkey,
    proposalInstructions,
    realm?.owner,
  ])

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
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const refetchProposals = useWalletStore((s) => s.actions.refetchProposals)
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
      await refetchProposals()
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
