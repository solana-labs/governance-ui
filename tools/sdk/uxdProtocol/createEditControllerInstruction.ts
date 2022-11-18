import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createEditControllerInstruction = ({
  uxdProgramId,
  authority,
  redeemableGlobalSupplyCap,
}: {
  uxdProgramId: PublicKey;
  authority: PublicKey;
  redeemableGlobalSupplyCap?: number;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);

  return client.createEditControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    {
      redeemableGlobalSupplyCap,
    },
    Provider.defaultOptions(),
  );
};

export default createEditControllerInstruction;
