import React from 'react'
import { flagInstructionError } from 'actions/flagInstructionError'
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalInstruction,
  TokenOwnerRecord,
} from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { RpcContext } from '@models/core/api'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { PlayState } from './ExecuteInstructionButton'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import { notify } from '@utils/notifications'
import { PublicKey } from '@solana/web3.js'

export function FlagInstructionErrorButton({
  proposal,
  proposalInstruction,
  playState,
  proposalAuthority,
}: {
  proposal: ParsedAccount<Proposal>
  proposalInstruction: ParsedAccount<ProposalInstruction>
  playState: PlayState
  proposalAuthority: ParsedAccount<TokenOwnerRecord> | undefined
}) {
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  if (
    playState !== PlayState.Error ||
    proposalInstruction.info.executionStatus !==
      InstructionExecutionStatus.Error ||
    !proposalAuthority
  ) {
    return null
  }

  const onFlagError = async () => {
    try {
      const rpcContext = new RpcContext(
        new PublicKey(proposal.account.owner.toString()),
        realmInfo?.programVersion,
        wallet,
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
        <Button>
          <ExclamationCircleIcon
            className="h-5 text-red w-5"
            onClick={onFlagError}
          />
        </Button>
      </p>
    </Tooltip>
  )
}
