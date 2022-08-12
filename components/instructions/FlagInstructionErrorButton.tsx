import React from 'react';
import { flagInstructionError } from 'actions/flagInstructionError';
import {
  InstructionExecutionStatus,
  Proposal,
  ProposalState,
  ProposalTransaction,
  TokenOwnerRecord,
} from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import useRealm from '@hooks/useRealm';
import useWalletStore from 'stores/useWalletStore';
import { PlayState } from './ExecuteInstructionButton';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import { notify } from '@utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { getProgramVersionForRealm } from '@models/registry/api';

export function FlagInstructionErrorButton({
  proposal,
  proposalInstruction,
  playState,
  proposalAuthority,
}: {
  proposal: ProgramAccount<Proposal>;
  proposalInstruction: ProgramAccount<ProposalTransaction>;
  playState: PlayState;
  proposalAuthority: ProgramAccount<TokenOwnerRecord> | undefined;
}) {
  const { realmInfo } = useRealm();
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);

  if (
    proposal.account.state === ProposalState.ExecutingWithErrors ||
    playState !== PlayState.Error ||
    proposalInstruction.account.executionStatus !==
      InstructionExecutionStatus.Error ||
    !proposalAuthority
  ) {
    return null;
  }

  const onFlagError = async () => {
    try {
      const rpcContext = new RpcContext(
        new PublicKey(proposal.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint,
      );

      await flagInstructionError(
        rpcContext,
        proposal,
        proposalInstruction.pubkey,
      );
    } catch (error) {
      notify({
        type: 'error',
        message: 'could not flag as broken',
        description: `${error}`,
      });
    }
  };

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
  );
}
