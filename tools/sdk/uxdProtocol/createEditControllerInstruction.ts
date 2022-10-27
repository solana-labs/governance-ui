import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import {
  Controller,
  MangoDepository,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import {
  getDepositoryMintInfo,
  getInsuranceMintInfo,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient';

const createEditControllerInstruction = ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  quoteMintAndRedeemSoftCap,
  redeemableSoftCap,
  redeemableGlobalSupplyCap,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  redeemableSoftCap?: number;
  redeemableGlobalSupplyCap?: number;
} & ({
  depositoryMintName: string;
  insuranceMintName: string;
  quoteMintAndRedeemSoftCap: number;
} | null)): TransactionInstruction => {
  let depository: MangoDepository;

  if (typeof quoteMintAndRedeemSoftCap !== 'undefined') {
    const {
      address: depositoryMint,
      decimals: depositoryDecimals,
    } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

    const {
      address: insuranceMint,
      decimals: insuranceDecimals,
    } = getInsuranceMintInfo(connection.cluster, insuranceMintName);

    depository = instantiateMangoDepository({
      uxdProgramId,
      depositoryMint,
      insuranceMint,
      depositoryName: depositoryMintName,
      depositoryDecimals,
      insuranceName: insuranceMintName,
      insuranceDecimals,
    });
  }

  const client = uxdClient(uxdProgramId);

  return client.createEditControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    {
      quoteMintAndRedeemSoftCap:
        typeof quoteMintAndRedeemSoftCap !== 'undefined'
          ? {
              value: quoteMintAndRedeemSoftCap,
              depository: depository!,
            }
          : undefined,
      redeemableSoftCap,
      redeemableGlobalSupplyCap,
    },
    Provider.defaultOptions(),
  );
};

export default createEditControllerInstruction;
