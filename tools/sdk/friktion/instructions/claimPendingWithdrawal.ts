import { Wallet } from '@project-serum/sol-wallet-adapter';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { buildVoltSDK } from '../friktion';

const claimPendingWithdrawal = async ({
  connection,
  wallet,
  governancePubkey,
  voltVaultId,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
  voltVaultId: string;
}) => {
  const cVoltSDK = await buildVoltSDK({
    connection,
    wallet,
    voltVaultId,
    governancePubkey,
  });

  const [govVoltMintATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.underlyingAssetMint,
  );

  return cVoltSDK.claimPendingWithdrawal(new PublicKey(govVoltMintATA));
};

export default claimPendingWithdrawal;
