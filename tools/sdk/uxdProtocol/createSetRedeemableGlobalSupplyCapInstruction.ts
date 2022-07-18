import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createSetRedeemableGlobalSupplyCapInstruction = ({
  uxdProgramId,
  supplyCapUiAmount,
  authority,
}: {
  uxdProgramId: PublicKey;
  supplyCapUiAmount: number;
  authority: PublicKey;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);
  return client.createSetRedeemableGlobalSupplyCapInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    supplyCapUiAmount,
    Provider.defaultOptions(),
  );
};

export default createSetRedeemableGlobalSupplyCapInstruction;
