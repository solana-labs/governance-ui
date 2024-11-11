// Exposes a 'realms-friendly' version of the generic useVoterWeightPlugins hook,
// which knows how to get the current realm, governance mint, and wallet public keys
// this simplifies usage across the realms codebase
import { useVoterWeightPlugins } from '../VoterWeightPlugins'
import { useRealmQuery } from '@hooks/queries/realm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { GovernanceRole } from '../@types/types'
import { useSelectedDelegatorStore } from '../stores/useSelectedDelegatorStore'
import { UseVoterWeightPluginsReturnType } from '../VoterWeightPlugins/useVoterWeightPlugins'
import { PublicKey } from '@solana/web3.js'
import { CalculatedWeight } from '../VoterWeightPlugins/lib/types'
import useDelegators from '@components/VotePanel/useDelegators'
import {BN_ZERO} from "@solana/spl-governance";
import {TokenOwnerRecord} from "@solana/spl-governance/lib/governance/accounts";
import {SignerWalletAdapter} from "@solana/wallet-adapter-base";

export type UseRealmVoterWeightPluginsReturnType = UseVoterWeightPluginsReturnType & {
  totalCalculatedVoterWeight: CalculatedWeight | undefined,
  ownVoterWeight: CalculatedWeight | undefined
  voterWeightForWallet: (walletPublicKey: PublicKey) => CalculatedWeight | undefined
  voterWeightPkForWallet: (walletPublicKey: PublicKey) => PublicKey | undefined
}

/**
 * Select the wallets to determine the voter weights for as follows:
 * - If a delegator is selected, use it only
 * - If delegators are available, use them and the connected wallet (in first position)
 * - If no delegators are available, use the connected wallet only
 * @param selectedDelegator
 * @param delegators
 * @param wallet
 */
const getWalletList = (
    selectedDelegator: PublicKey | undefined,
    delegators: TokenOwnerRecord[] | undefined,
    wallet: SignerWalletAdapter | undefined
): PublicKey[] => {
  if (!wallet?.publicKey) return [];

  // if selectedDelegator is not set, this means "yourself + all delegators"
  if (selectedDelegator) {
    return [selectedDelegator]
  }

  if (delegators) {
    const delegatorOwners = delegators.map((d) => d.governingTokenOwner)

    return [
        wallet.publicKey,
        ...delegatorOwners
    ]
  }

  return [wallet.publicKey];
}

export const useRealmVoterWeightPlugins = (
  role: GovernanceRole = 'community'
): UseRealmVoterWeightPluginsReturnType => {
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const governanceMintPublicKey =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint
  const selectedDelegator = useSelectedDelegatorStore((s) =>
    role === 'community' ? s.communityDelegator : s.councilDelegator
  )

  const mainWalletPk = selectedDelegator || wallet?.publicKey

  const delegators = useDelegators(role)
  const walletPublicKeys =  getWalletList(
      selectedDelegator,
      delegators?.map(programAccount => programAccount.account),
      wallet
  );

  // if a delegator is selected, use it, otherwise use the currently connected wallet
  const nonAggregatedResult = useVoterWeightPlugins({
    realmPublicKey: realm?.pubkey,
    governanceMintPublicKey,
    walletPublicKeys,
    realmConfig: realm?.account.config,
  })

  const totalCalculatedVoterWeight = nonAggregatedResult.calculatedVoterWeights?.length ? nonAggregatedResult.calculatedVoterWeights?.reduce(
    (acc, weight) => {
      if (!acc) return weight;

      const initialValue = weight.initialValue === null ? (acc.initialValue === null ? null : acc.initialValue) : weight.initialValue.add(acc.initialValue ?? BN_ZERO);
      const value = weight.value === null ? (acc.value === null ? null : acc.value) : weight.value.add(acc.value ?? BN_ZERO);
      // Note - voter-specific details (e.g. plugin weights) are not aggregated and just use the first one
      const details = acc.details

      return {
        details,
        initialValue,
        value,
      }
    }
  ) : undefined;


  // This requires that the index of the wallet in the list of wallets remains consistent with the output voter weights,
  // while not ideal, this is simpler than the alternative, which would be to return a map of wallet public keys to voter weights
  // or something similar.
  const voterWeightForWallet = (walletPublicKey: PublicKey): CalculatedWeight | undefined => {
    const walletIndex = walletPublicKeys.findIndex((pk) => pk.equals(walletPublicKey))
    if (walletIndex === -1) return undefined; // the wallet is not one of the ones passed in
    return nonAggregatedResult.calculatedVoterWeights?.[walletIndex]
  }

  const voterWeightPkForWallet = (walletPublicKey: PublicKey): PublicKey | undefined => {
    const walletIndex = walletPublicKeys.findIndex((pk) => pk.equals(walletPublicKey))
    if (walletIndex === -1) return undefined; // the wallet is not one of the ones passed in
    return nonAggregatedResult.voterWeightPks?.[walletIndex]
  }

  const ownVoterWeight = mainWalletPk ? voterWeightForWallet(mainWalletPk) : undefined

  return {
    ...nonAggregatedResult,
    totalCalculatedVoterWeight,
    ownVoterWeight,
    voterWeightForWallet,
    voterWeightPkForWallet,
  }
}

// Get the current weights for the community and council governances - should be used in cases where the realm is known but the choice of governance is not,
// e.g. when creating a proposal
export const useRealmVoterWeights = () => {
  const {
    calculatedMaxVoterWeight: communityMaxWeight,
    totalCalculatedVoterWeight: communityWeight,
  } = useRealmVoterWeightPlugins('community')
  const {
    calculatedMaxVoterWeight: councilMaxWeight,
    totalCalculatedVoterWeight: councilWeight,
  } = useRealmVoterWeightPlugins('council')

  return {
    communityMaxWeight,
    communityWeight,
    councilMaxWeight,
    councilWeight,
  }
}
