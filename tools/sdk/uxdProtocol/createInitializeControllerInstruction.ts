import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createInitializeControllerInstruction = ({
  uxdProgramId,
  authority,
  payer,
}: {
  uxdProgramId: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);

  return client.createInitializeControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    Provider.defaultOptions(),
    payer,
  );
};

export default createInitializeControllerInstruction;
