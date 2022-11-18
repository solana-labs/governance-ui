import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import {
  Controller,
  IdentityDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import {
  getDepositoryMintInfo,
  getInsuranceMintInfo,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient';

const createReinjectMangoToIdentityDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  payer,
  depositoryMintName,
  insuranceMintName,
  collateralMint,
  collateralMintSymbol,
  collateralMintDecimals,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  collateralMint: PublicKey;
  collateralMintSymbol: string;
  collateralMintDecimals: number;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const {
    address: depositoryMint,
    decimals: depositoryDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const {
    address: insuranceMint,
    decimals: insuranceDecimals,
  } = getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const mangoDepository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  const identityDepository = new IdentityDepository(
    collateralMint,
    collateralMintSymbol,
    collateralMintDecimals,
    uxdProgramId,
  );

  return client.createReinjectMangoToIdentityDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    identityDepository,
    mangoDepository,
    authority,
    Provider.defaultOptions(),
    payer,
  );
};

export default createReinjectMangoToIdentityDepositoryInstruction;
