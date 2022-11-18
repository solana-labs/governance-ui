import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import {
  Controller,
  IdentityDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createInitializeIdentityDepositoryInstruction = ({
  uxdProgramId,
  authority,
  payer,
  collateralMint,
  collateralMintSymbol,
  collateralMintDecimals,
}: {
  uxdProgramId: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  collateralMint: PublicKey;
  collateralMintSymbol: string;
  collateralMintDecimals: number;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);

  const identityDepository = new IdentityDepository(
    collateralMint,
    collateralMintSymbol,
    collateralMintDecimals,
    uxdProgramId,
  );

  return client.createInitializeIdentityDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    identityDepository,
    authority,
    Provider.defaultOptions(),
    payer,
  );
};

export default createInitializeIdentityDepositoryInstruction;
