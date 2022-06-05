import { PublicKey } from '@solana/web3.js'
import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { parseMintMaxVoteWeight } from '@tools/governance/units'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import { withCreateMint } from '@tools/sdk/splToken/withCreateMint'
import { withCreateAssociatedTokenAccount } from '@tools/sdk/splToken/withCreateAssociatedTokenAccount'
import { withMintTo } from '@tools/sdk/splToken/withMintTo'
import { getWalletPublicKey } from '@utils/sendTransactions'
import { MAX_TOKENS_TO_DISABLE } from '@tools/constants'

export async function prepareRealmCreation({
  connection,
  wallet,
  programIdAddress,
  tokensToGovernThreshold,

  existingCommunityMintPk,
  communityMintSupplyFactor: rawCMSF,

  createCouncil = false,
  existingCouncilMintPk,

  councilWalletPks,

  mintsSetupInstructions,
  mintsSetupSigners,
  councilMembersInstructions,
}) {
  const communityMintSupplyFactor = parseMintMaxVoteWeight(rawCMSF)
  const walletPk = getWalletPublicKey(wallet)
  const programIdPk = new PublicKey(programIdAddress)
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programIdPk
  )

  console.log(
    'Prepare realm - program and version',
    programIdAddress,
    programVersion
  )
  const communityMintAccount =
    existingCommunityMintPk &&
    (await tryGetMint(connection, existingCommunityMintPk))
  const zeroCommunityTokenSupply = existingCommunityMintPk
    ? communityMintAccount?.account.supply.isZero()
    : true

  const councilMintAccount =
    existingCouncilMintPk &&
    (await tryGetMint(connection, existingCouncilMintPk))
  const zeroCouncilTokenSupply = existingCommunityMintPk
    ? councilMintAccount?.account.supply.isZero()
    : true

  console.log('Prepare realm - community mint address', existingCommunityMintPk)
  // Community mint decimals
  const communityMintDecimals = 6
  let communityMintPk = existingCommunityMintPk
  if (!communityMintPk) {
    // Create community mint
    communityMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      communityMintDecimals,
      walletPk
    )
  }

  console.log(
    'Prepare realm - zero community token supply',
    zeroCommunityTokenSupply,
    ' | zero council token supply',
    zeroCouncilTokenSupply
  )
  console.log('Prepare realm - council mint address', existingCouncilMintPk)
  // Create council mint
  let councilMintPk
  if (
    zeroCommunityTokenSupply &&
    zeroCouncilTokenSupply &&
    councilWalletPks.length === 0
  ) {
    councilWalletPks.push(wallet.publicKey as PublicKey)
    councilMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      0,
      walletPk
    )
  } else if (!existingCouncilMintPk && createCouncil) {
    councilMintPk = await withCreateMint(
      connection,
      mintsSetupInstructions,
      mintsSetupSigners,
      walletPk,
      null,
      0,
      walletPk
    )
  } else {
    councilMintPk = existingCouncilMintPk
  }

  let walletAtaPk: PublicKey | undefined
  const tokenAmount = 1

  console.log('Prepare realm - council members', councilWalletPks)
  for (const teamWalletPk of councilWalletPks) {
    const ataPk = await withCreateAssociatedTokenAccount(
      councilMembersInstructions,
      councilMintPk,
      teamWalletPk,
      walletPk
    )

    // Mint 1 council token to each team member
    await withMintTo(
      councilMembersInstructions,
      councilMintPk,
      ataPk,
      walletPk,
      tokenAmount
    )

    if (teamWalletPk.equals(walletPk)) {
      walletAtaPk = ataPk
    }
  }

  // Convert to mint natural amount
  const minCommunityTokensToCreateAsMintValue =
    typeof tokensToGovernThreshold !== 'undefined'
      ? getMintNaturalAmountFromDecimalAsBN(
          tokensToGovernThreshold,
          communityMintDecimals
        )
      : MAX_TOKENS_TO_DISABLE

  return {
    programIdPk,
    programVersion,
    walletPk,
    walletAtaPk,
    communityMintPk,
    councilMintPk,
    communityMintSupplyFactor,
    minCommunityTokensToCreateAsMintValue,
  }
}
