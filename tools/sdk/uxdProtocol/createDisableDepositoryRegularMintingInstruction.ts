import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  uxdClient,
  instantiateMangoDepository,
  getDepositoryMintInfo,
  getInsuranceMintInfo,
} from './uxdClient';

const createDisableDepositoryRegularMintingInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  disableMinting,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  disableMinting: boolean;
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

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  return client.createDisableDepositoryRegularMintingInstruction(
    disableMinting,
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    Provider.defaultOptions(),
  );
};

export default createDisableDepositoryRegularMintingInstruction;
