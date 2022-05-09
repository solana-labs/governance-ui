import Decimal from 'decimal.js';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { buildVoltSDK } from '../friktion';

const depositToVolt = async ({
  connection,
  wallet,
  voltVaultId,
  governancePubkey,
  sourceTokenAccount,
  amount,
  decimals,
}: {
  connection: Connection;
  wallet: Wallet;
  voltVaultId: string;
  governancePubkey: PublicKey;
  sourceTokenAccount: PublicKey;
  amount: number;
  decimals: number;
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

  return cVoltSDK.depositWithClaim(
    new Decimal(amount),
    sourceTokenAccount,
    govVoltMintATA,
    false,
    governancePubkey,
    governancePubkey,
    decimals,
  );
};

export default depositToVolt;
