import {
  DEFAULT_NFT_TREASURY_MINT,
  HIDDEN_GOVERNANCES,
} from '@components/instructions/tools'
import { GovernanceAccountType } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  GovernedTokenAccount,
  parseMintAccountData,
} from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'

export default function useGovernanceAssets() {
  const { governances, tokenMints, realmTokenAccounts } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)

  const { ownVoterWeight, realm, symbol } = useRealm()
  const governancesArray = Object.keys(governances)
    .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
    .map((key) => governances[key])

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.account?.accountType === type
    )
    return governancesFiltered
  }
  function canUseGovernanceForInstruction(type: GovernanceAccountType) {
    return (
      realm &&
      getGovernancesByAccountType(type).some((g) =>
        ownVoterWeight.canCreateProposal(g.account.config)
      )
    )
  }
  const canMintRealmCommunityToken = () => {
    const governances = getGovernancesByAccountType(
      GovernanceAccountType.MintGovernance
    )
    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.communityMint.toBase58()
    )
  }
  const canMintRealmCouncilToken = () => {
    const governances = getGovernancesByAccountType(
      GovernanceAccountType.MintGovernance
    )

    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.config.councilMint?.toBase58()
    )
  }
  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.TokenGovernance
  )

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.ProgramGovernance
  )

  const canUseMintInstruction = canUseGovernanceForInstruction(
    GovernanceAccountType.MintGovernance
  )

  const canUseUxdInstructions =
    symbol === 'UXP' &&
    canUseGovernanceForInstruction(GovernanceAccountType.ProgramGovernance)

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((g) =>
      ownVoterWeight.canCreateProposal(g.account.config)
    )

  const getAvailableInstructions = () => {
    return availableInstructions.filter((x) => x.isVisible)
  }
  function prepareTokenGovernances() {
    const tokenGovernances = getGovernancesByAccountType(
      GovernanceAccountType.TokenGovernance
    )
    const governedTokenAccounts: GovernedTokenAccount[] = []
    for (const i of tokenGovernances) {
      const realmTokenAccount = realmTokenAccounts.find(
        (x) => x.publicKey.toBase58() === i.account.governedAccount.toBase58()
      )
      const mint = tokenMints.find(
        (x) =>
          realmTokenAccount?.account.mint.toBase58() === x.publicKey.toBase58()
      )
      const obj = {
        governance: i,
        token: realmTokenAccount,
        mint,
        isNft: mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT,
      }
      governedTokenAccounts.push(obj)
    }
    return governedTokenAccounts
  }
  async function getMintWithGovernances() {
    const mintGovernances = getGovernancesByAccountType(
      GovernanceAccountType.MintGovernance
    )
    const governedMintInfoAccounts: GovernedMintInfoAccount[] = []
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.account.governedAccount)
    )
    mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
      const governance = mintGovernances[index]
      if (!mintAccountInfo) {
        throw new Error(
          `Missing mintAccountInfo for: ${governance.pubkey.toBase58()}`
        )
      }
      const data = Buffer.from(mintAccountInfo.data)
      const parsedMintInfo = parseMintAccountData(data) as MintInfo
      const obj = {
        governance,
        mintInfo: parsedMintInfo,
      }
      governedMintInfoAccounts.push(obj)
    })
    return governedMintInfoAccounts
  }
  const governedTokenAccounts = prepareTokenGovernances()
  const governedTokenAccountsWithoutNfts = governedTokenAccounts.filter(
    (x) => x.mint?.publicKey.toBase58() !== DEFAULT_NFT_TREASURY_MINT
  )
  const nftsGovernedTokenAccounts = governedTokenAccounts.filter(
    (x) => x.mint?.publicKey.toBase58() === DEFAULT_NFT_TREASURY_MINT
  )
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (g) =>
      g.governance &&
      ownVoterWeight.canCreateProposal(g.governance?.account?.config)
  )

  const availableInstructions = [
    {
      id: Instructions.InitializeController,
      name: 'Initialize Controller',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.SetRedeemableGlobalSupplyCap,
      name: 'Set Redeemable Global Supply Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.SetMangoDepositoriesRedeemableSoftCap,
      name: 'Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.RegisterMangoDepository,
      name: 'Register Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.DepositInsuranceToMangoDepository,
      name: 'Deposit Insurance To Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.WithdrawInsuranceFromMangoDepository,
      name: 'Withdraw Insurance From Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: Instructions.AddLiquidityRaydium,
      name: 'Add To Raydium Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTokenTransferInstruction,
    },
    {
      id: Instructions.ProgramUpgrade,
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: Instructions.SetProgramAuthority,
      name: 'Set Program Authority',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: Instructions.Mint,
      name: 'Mint Tokens',
      isVisible: canUseMintInstruction,
    },
    {
      id: Instructions.Base64,
      name: 'Execute Custom Instruction',
      isVisible: canUseAnyInstruction,
    },
    {
      id: Instructions.MangoMakeChangeMaxAccounts,
      name: 'Mango - change max accounts',
      isVisible: canUseProgramUpgradeInstruction && symbol === 'MNGO',
    },
    {
      id: Instructions.None,
      name: 'None',
      isVisible:
        realm &&
        Object.values(governances).some((g) =>
          ownVoterWeight.canCreateProposal(g.account.config)
        ),
    },
  ]

  return {
    governancesArray,
    getGovernancesByAccountType,
    availableInstructions,
    getAvailableInstructions,
    governedTokenAccounts,
    getMintWithGovernances,
    canUseTransferInstruction,
    canUseMintInstruction,
    canMintRealmCommunityToken,
    canMintRealmCouncilToken,
    canUseProgramUpgradeInstruction,
    governedTokenAccountsWithoutNfts,
    nftsGovernedTokenAccounts,
  }
}
