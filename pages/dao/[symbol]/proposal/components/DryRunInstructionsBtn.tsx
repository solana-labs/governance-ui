import Button, { LinkButton, SecondaryButton } from '@components/Button';
import { getExplorerInspectorUrl } from '@components/explorer/tools';
import Loading from '@components/Loading';
import Modal from '@components/Modal';
import {
  getInstructionDataFromBase64,
  simulateTransaction,
} from '@solana/spl-governance';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import {
  Connection,
  SimulatedTransactionResponse,
  Transaction,
} from '@solana/web3.js';
import { notify } from '@utils/notifications';
import { FormInstructionData } from '@utils/uiTypes/proposalCreationTypes';
import React, { useState } from 'react';
import useWalletStore from 'stores/useWalletStore';

async function dryRunInstructions(
  connection: Connection,
  wallet: WalletAdapter,
  formInstructionsData: FormInstructionData[],
) {
  const transaction = new Transaction({
    feePayer: wallet.publicKey,
  });

  formInstructionsData.forEach((formInstructionData) => {
    if (formInstructionData.prerequisiteInstructions?.length) {
      transaction.add(...formInstructionData.prerequisiteInstructions);
    }

    const instructionData = getInstructionDataFromBase64(
      formInstructionData.serializedInstruction,
    );

    transaction.add({
      keys: instructionData.accounts,
      programId: instructionData.programId,
      data: Buffer.from(instructionData.data),
    });
  });

  const result = await simulateTransaction(connection, transaction, 'single');

  return { response: result.value, transaction };
}

const DryRunInstructionsBtn = ({
  getFormInstructionsData,
}: {
  getFormInstructionsData: (() => Promise<FormInstructionData[]>) | undefined;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{
    response: SimulatedTransactionResponse;
    transaction: Transaction;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const onInspect = () => {
    if (!result) {
      notify({ type: 'error', message: 'no results to inspect' });
      return;
    }

    const inspectUrl = getExplorerInspectorUrl(
      connection.endpoint,
      result.transaction,
    );

    window.open(inspectUrl, '_blank');
  };

  const handleDryRun = async () => {
    try {
      if (!getFormInstructionsData) {
        throw 'No getInstructionsData function provided';
      }

      setIsPending(true);

      const formInstructionsData = await getFormInstructionsData();

      // Check the instructions to be valid
      formInstructionsData.forEach((instructionData) => {
        if (!instructionData?.isValid) {
          setIsPending(false);
          throw new Error('Invalid instruction');
        }
      });

      const result = await dryRunInstructions(
        connection.current,
        wallet!,
        formInstructionsData,
      );

      setResult(result);
      setIsOpen(true);
    } catch (ex) {
      notify({
        type: 'error',
        message: `Can't simulate transaction`,
        description: 'The instruction is invalid',
      });

      console.error('Simulation error', ex);
    } finally {
      setIsPending(false);
    }
  };

  const onClose = () => {
    setIsOpen(false);
    setResult(null);
  };

  function getLogTextType(text: string): string | undefined {
    const lowercaseText = text.toLowerCase();

    if (lowercaseText.includes('failed')) {
      return 'text-red';
    }

    if (lowercaseText.includes('success')) {
      return 'text-green';
    }
  }

  return (
    <>
      <SecondaryButton
        onClick={handleDryRun}
        disabled={isPending || !wallet?.connected}
        small
      >
        {isPending ? <Loading /> : 'Preview all instructions'}
      </SecondaryButton>

      {result?.response && (
        <Modal onClose={onClose} isOpen={isOpen}>
          <h2>
            {result?.response.err
              ? 'Simulation error'
              : 'Simulation successful'}
          </h2>

          <ul className="break-all instruction-log-list text-sm">
            {result?.response.logs?.map((log, i) => (
              <li className="mb-3" key={i}>
                <div className={getLogTextType(log)}>{log}</div>
              </li>
            ))}
          </ul>

          <div className="flex items-center pt-3">
            <Button onClick={onInspect}>Inspect</Button>

            <LinkButton className="font-bold ml-4" onClick={onClose}>
              Close
            </LinkButton>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DryRunInstructionsBtn;
