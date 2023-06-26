import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createEditControllerInstruction = ({
  uxdProgramId,
  authority,
  redeemableGlobalSupplyCap,
  depositoriesRoutingWeightBps,
  routerDepositories,
}: {
  uxdProgramId: PublicKey;
  authority: PublicKey;
  redeemableGlobalSupplyCap?: number;
  depositoriesRoutingWeightBps?: {
    identityDepositoryWeightBps: number;
    mercurialVaultDepositoryWeightBps: number;
    credixLpDepositoryWeightBps: number;
  };
  routerDepositories?: {
    identityDepository: PublicKey;
    mercurialVaultDepository: PublicKey;
    credixLpDepository: PublicKey;
  };
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);

  return client.createEditControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    {
      redeemableGlobalSupplyCap,
      depositoriesRoutingWeightBps,
      routerDepositories,
    },
    Provider.defaultOptions(),
  );
};

export default createEditControllerInstruction;
