import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createSetMangoDepositoriesRedeemableSoftCapInstruction = ({
  uxdProgramId,
  softCapUiAmount,
  authority,
}: {
  uxdProgramId: PublicKey;
  softCapUiAmount: number;
  authority: PublicKey;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);
  return client.createSetMangoDepositoriesRedeemableSoftCapInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    softCapUiAmount,
    Provider.defaultOptions(),
  );
};

export default createSetMangoDepositoriesRedeemableSoftCapInstruction;
