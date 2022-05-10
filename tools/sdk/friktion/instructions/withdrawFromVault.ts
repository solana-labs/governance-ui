import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { findATAAddrSync } from '@utils/ataTools';
import { buildVoltSDK } from '../friktion';

const withdrawFromVault = async ({
  connection,
  wallet,
  voltVaultId,
  governancePubkey,
  amount,
}: {
  connection: Connection;
  wallet: Wallet;
  voltVaultId: string;
  governancePubkey: PublicKey;
  amount: BN;
}) => {
  const cVoltSDK = await buildVoltSDK({
    connection,
    wallet,
    voltVaultId,
    governancePubkey,
  });

  const [govVoltMintATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.vaultMint,
  );

  const [govUnderlyingATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.underlyingAssetMint,
  );

  const withdrawIx = await cVoltSDK.withdrawWithClaim(
    amount,
    govVoltMintATA,
    govUnderlyingATA,
    governancePubkey,
  );

  const governedAccountIndex = withdrawIx.keys.findIndex(
    (k) => k.pubkey.toString() === governancePubkey.toString(),
  );
  withdrawIx.keys[governedAccountIndex].isSigner = true;

  return withdrawIx;
};

export default withdrawFromVault;
