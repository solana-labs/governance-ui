import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { getCredixLpDepository, uxdClient } from './uxdClient';

const createEditCredixLpDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  redeemableAmountUnderManagementCap,
  mintingFeeInBps,
  redeemingFeeInBps,
  mintingDisabled,
  profitsBeneficiaryCollateral,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  redeemableAmountUnderManagementCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
  mintingDisabled?: boolean;
  profitsBeneficiaryCollateral?: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const depository = await getCredixLpDepository(
    connection,
    uxdProgramId,
    depositoryMintName,
  );

  return client.createEditCredixLpDepositoryInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    {
      redeemableAmountUnderManagementCap,
      mintingFeeInBps,
      redeemingFeeInBps,
      mintingDisabled,
      profitsBeneficiaryCollateral,
    },
    Provider.defaultOptions(),
  );
};

export default createEditCredixLpDepositoryInstruction;
