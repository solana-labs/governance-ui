import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  IdentityDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createRedeemFromIdentityDepositoryInstruction = async ({
  uxdProgramId,
  user,
  redeemableAmount,
  payer,
  collateralMint,
  collateralMintSymbol,
  collateralMintDecimals,
}: {
  uxdProgramId: PublicKey;
  user: PublicKey;
  redeemableAmount: number;
  payer: PublicKey;
  collateralMint: PublicKey;
  collateralMintSymbol: string;
  collateralMintDecimals: number;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const identityDepository = new IdentityDepository(
    collateralMint,
    collateralMintSymbol,
    collateralMintDecimals,
    uxdProgramId,
  );

  return client.createRedeemFromIdentityDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    identityDepository,
    user,
    redeemableAmount,
    Provider.defaultOptions(),
    payer,
  );
};

export default createRedeemFromIdentityDepositoryInstruction;
