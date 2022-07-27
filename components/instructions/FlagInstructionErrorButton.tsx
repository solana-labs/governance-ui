import React from 'react'
import { flagInstructionError } from 'actions/flagInstructionError'
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalTransaction,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { PlayState } from './ExecuteInstructionButton'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { notify } from '@utils/notifications'
import { PublicKey } from '@solana/web3.js'
import { getProgramVersionForRealm } from '@models/registry/api'

export function FlagInstructionErrorButton({
  proposal,
  proposalInstruction,
  playState,
}: {
  proposal: ProgramAccount<Proposal>
  proposalInstruction: ProgramAccount<ProposalTransaction>
  playState: PlayState
}) {
  const { realmInfo, ownTokenRecord, ownCouncilTokenRecord } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const isProposalOwner =
    proposal.account.tokenOwnerRecord.toBase58() ===
      ownTokenRecord?.pubkey.toBase58() ||
    proposal.account.tokenOwnerRecord.toBase58() ===
      ownCouncilTokenRecord?.pubkey.toBase58()
  if (
    (playState !== PlayState.Error &&
      proposalInstruction.account.executionStatus !==
        InstructionExecutionStatus.Error) ||
    !isProposalOwner
  ) {
    return null
  }

  const onFlagError = async () => {
    try {
      const rpcContext = new RpcContext(
        new PublicKey(proposal.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )

      await flagInstructionError(
        rpcContext,
        proposal,
        proposalInstruction.pubkey
      )
    } catch (error) {
      notify({
        type: 'error',
        message: 'could not flag as broken',
        description: `${error}`,
      })
    }
  }

  return (
    <Tooltip content="Flag instruction as broken">
      <p className="border-dashed border-fgd-3 text-fgd-3 text-xs hover:cursor-help border-b-0">
        <Button onClick={onFlagError}>
          <ExclamationCircleIcon className="h-5 text-red w-5" />
        </Button>
      </p>
    </Tooltip>
  )
}
