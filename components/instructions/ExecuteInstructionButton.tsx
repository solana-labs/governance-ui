import { useEffect, useState } from 'react';
import { executeTransaction } from 'actions/executeTransaction';
import {
  InstructionExecutionStatus,
  ProposalTransaction,
} from '@solana/spl-governance';
import React from 'react';
import { CheckCircleIcon, PlayIcon, RefreshIcon } from '@heroicons/react/solid';
import Button from '@components/Button';
import { RpcContext } from '@solana/spl-governance';
import useRealm from '@hooks/useRealm';
import useWalletStore, {
  EnhancedProposal,
  EnhancedProposalState,
} from 'stores/useWalletStore';
import { ProgramAccount } from '@solana/spl-governance';
import { Keypair, PublicKey } from '@solana/web3.js';
import Tooltip from '@components/Tooltip';
import { getProgramVersionForRealm } from '@models/registry/api';
import useTransactionSignature from '@hooks/useTransactionSignature';
import { notify } from '@utils/notifications';

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
  additionalSigner,
  disabled,
}: {
  proposal: ProgramAccount<EnhancedProposal>;
  proposalInstruction: ProgramAccount<ProposalTransaction>;
  playing: PlayState;
  additionalSigner?: Keypair;
  setPlaying: React.Dispatch<React.SetStateAction<PlayState>>;
  disabled?: boolean;
}) {
  const { realmInfo } = useRealm();
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm);
  const connected = useWalletStore((s) => s.connected);
  const [currentSlot, setCurrentSlot] = useState(0);
  const { transactionSignature } = useTransactionSignature(
    proposalInstruction.pubkey,
  );
  const canExecuteAt = proposal?.account.votingCompletedAt
    ? proposal.account.votingCompletedAt.toNumber() + 1
    : 0;

  const ineligibleToSee = currentSlot - canExecuteAt >= 0;

  const rpcContext = new RpcContext(
    new PublicKey(proposal.owner.toString()),
    getProgramVersionForRealm(realmInfo!),
    wallet!,
    connection.current,
    connection.endpoint,
  );

  useEffect(() => {
    if (ineligibleToSee && proposal) {
      const timer = setTimeout(() => {
        rpcContext.connection.getSlot().then(setCurrentSlot);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [ineligibleToSee, rpcContext.connection, currentSlot]);

  const onExecuteInstruction = async () => {
    setPlaying(PlayState.Playing);

    try {
      await executeTransaction(
        rpcContext,
        proposal,
        proposalInstruction,
        additionalSigner,
      );
      await fetchRealm(realmInfo?.programId, realmInfo?.realmId);
    } catch (error) {
      notify({
        type: 'error',
        message: `error executing instruction ${error}`,
      });
      console.error('error executing instruction', error);

      setPlaying(PlayState.Error);

      return;
    }

    setPlaying(PlayState.Played);
  };
  if (
    proposalInstruction.account.executionStatus ===
    InstructionExecutionStatus.Success
  ) {
    return (
      <Tooltip content="instruction executed successfully">
        {transactionSignature ? (
          <a
            href={`https://explorer.solana.com/tx/${transactionSignature}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
          </a>
        ) : (
          <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
        )}
      </Tooltip>
    );
  }

  if (
    proposal.account.state !== EnhancedProposalState.Executing &&
    proposal.account.state !== EnhancedProposalState.ExecutingWithErrors &&
    proposal.account.state !== EnhancedProposalState.Succeeded
  ) {
    return null;
  }

  if (ineligibleToSee) {
    return null;
  }

  if (
    playing === PlayState.Unplayed &&
    proposalInstruction.account.executionStatus !==
      InstructionExecutionStatus.Error
  ) {
    return (
      <Button
        small
        disabled={!connected || disabled}
        onClick={onExecuteInstruction}
      >
        Execute
      </Button>
    );
  }

  if (playing === PlayState.Playing) {
    return <PlayIcon className="h-5 ml-2 text-orange w-5" />;
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
    );
  }

  return <CheckCircleIcon className="h-5 ml-2 text-green w-5" key="played" />;
}
