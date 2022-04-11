import { RedeemerWrapper, Saber } from '@saberhq/saber-periphery';
import { AugmentedProvider } from '@saberhq/solana-contrib';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import SaberPeripheryConfiguration, {
  SupportedMintName,
} from './configuration';

export async function redeemAllTokensFromMintProxyInstruction({
  augmentedProvider,
  authority,
  mintName,
}: {
  augmentedProvider: AugmentedProvider;
  authority: PublicKey;
  mintName: SupportedMintName;
}): Promise<TransactionInstruction> {
  const {
    rewardsTokenMint,
    redemptionTokenMint,
  } = SaberPeripheryConfiguration.mintSpecificAddresses[mintName];

  const [rewardsTokenAccount] = findATAAddrSync(authority, rewardsTokenMint);
  const [redemptionDestination] = findATAAddrSync(
    authority,
    redemptionTokenMint,
  );

  const redeemerWrapper = await RedeemerWrapper.load({
    sdk: Saber.load({
      provider: augmentedProvider,
    }),

    iouMint: rewardsTokenMint,
    redemptionMint: redemptionTokenMint,
  });

  return redeemerWrapper.redeemAllTokensFromMintProxyIx({
    sourceAuthority: authority,
    iouSource: rewardsTokenAccount,
    redemptionDestination,
  });
}
