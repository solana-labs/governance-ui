import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import {
  fetchTokenOwnerRecordByPubkey,
  useTokenOwnerRecordByPubkeyQuery,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './tokenOwnerRecord'
import BN from 'bn.js'
import { fetchDigitalAssetsByOwner } from './digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { ON_NFT_VOTER_V2 } from '@constants/flags'
import { fetchRealmByPubkey } from './realm'
import { fetchRealmConfigQuery } from './realmConfig'

import { StakeConnection } from "@parcl-oss/staking"
import {
  LegacyVoterWeightAdapter,
} from '@models/voteWeights'
import { PythClient } from '@pythnetwork/staking'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { findPluginName } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import {IdlAccounts} from "@coral-xyz/anchor";
import {NftVoter} from "../../idls/nft_voter";
import {getPluginRegistrarClientCached} from "@hooks/queries/pluginRegistrar";

export const getVanillaGovpower = async (
  connection: Connection,
  tokenOwnerRecord: PublicKey
) => {
  const torAccount = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecord
  )
  return torAccount.result
    ? torAccount.result.account.governingTokenDepositAmount
    : new BN(0)
}

export const useVanillaGovpower = (tokenOwnerRecordPk: PublicKey | undefined) => {
  const { data: torAccount } = useTokenOwnerRecordByPubkeyQuery(
    tokenOwnerRecordPk
  )
  return torAccount?.result
    ? torAccount.result.account.governingTokenDepositAmount
    : new BN(0)
}

export const getNftGovpowerForOwnerAndRegistrar = async(connection: Connection, owner: PublicKey, registrar: IdlAccounts<NftVoter>['registrar'] | undefined) => {
  if (registrar === undefined) throw new Error()
  const {collectionConfigs} = registrar

  // grab the user nfts
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const nfts = (await fetchDigitalAssetsByOwner(network, owner))
      // filter cnfts if not supported yet
      .filter((nft) => ON_NFT_VOTER_V2 || !nft.compression.compressed)

  // map nfts to power and sum them
  const power = nfts
      .map(
          (nft) =>
              // find collectionConfig such that the nft's `collection` grouping matches the collection id
              collectionConfigs.find(
                  (x) =>
                      x.collection.toString() ===
                      (nft.grouping.find((y) => y.group_key === 'collection')
                          ?.group_value ?? false)
                  // take the weight for that collection, or 0 if the nft matches none of the dao's collections
              )?.weight ?? new BN(0)
      )
      // sum
      .reduce((partialSum, a) => partialSum.add(a), new BN(0))

  return power
}

export const getNftGovpowerForOwner = async (connection: Connection, realmPk: PublicKey, owner: PublicKey) => {
  const registrar = await getPluginRegistrarClientCached<NftVoter>(realmPk, connection, owner, 'NFT');
  return getNftGovpowerForOwnerAndRegistrar(connection, owner, registrar);
}

export const getNftGovpower = async (
  connection: Connection,
  realmPk: PublicKey,
  tokenOwnerRecordPk: PublicKey
) => {
  // grab the owner of the TOR
  const { result: TOR } = await fetchTokenOwnerRecordByPubkey(
      connection,
      tokenOwnerRecordPk
  )
  if (TOR === undefined) throw new Error()
  const owner = TOR.account.governingTokenOwner
  return getNftGovpowerForOwner(connection, realmPk, owner);
}

export const getPythGovPower = async (
  connection: Connection,
  user: PublicKey | undefined
): Promise<BN> => {
  if (!user) return new BN(0)

  const pythClient = await PythClient.connect(
    connection,
    new NodeWallet(new Keypair())
  )
  const stakeAccount = await pythClient.getMainAccount(user)

  if (stakeAccount) {
    return stakeAccount.getVoterWeight(await pythClient.getTime()).toBN()
  } else {
    return new BN(0)
  }
}

export const getParclGovPower = async (
  connection: Connection,
  user: PublicKey | undefined
): Promise<BN> => {
  if (!user) return new BN(0)
  const client = await StakeConnection.connect(
    connection,
    new NodeWallet(new Keypair())
  )
  const stakeAccount = await client.getMainAccount(user)
  if (stakeAccount) {
    return stakeAccount.getVoterWeight(await client.getTime()).toBN()
  } else {
    return new BN(0)
  }
}


export const determineVotingPowerType = async (
  connection: Connection,
  realmPk: PublicKey,
  role: 'council' | 'community'
) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (!realm) throw new Error()

  const config = await fetchRealmConfigQuery(connection, realmPk)
  const programId =
    role === 'community'
      ? config.result?.account.communityTokenConfig.voterWeightAddin
      : config.result?.account.councilTokenConfig.voterWeightAddin

  return findPluginName(programId)
}

// TODO use HOC to provide voting power to components that need voting power without knowing plugin
// this is an efficiency thing to save on queries, since we can't have conditional useQuery hooks.
// i guess you can just use the enabled flag..
/* 
export const WithCommunityGovernancePower = <
  P extends { communityGovernancePower: BN | undefined }
>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'communityGovernancePower'>> =>
  function Enhanced(props) {
    const { connection } = useConnection()
    const kind = 'community'
    const realmPk = useSelectedRealmPubkey()

    const { result: plugin } = useAsync(
      async () =>
        kind && realmPk && determineVotingPowerType(connection, realmPk, kind),
      [connection, realmPk, kind]
    )
    // this `props as P` thing is annoying!! ts should know better -@asktree
    return <Component {...(props as P)} />
  }

export const WithVsrGovernancePower = <
  P extends { communityGovernancePower: BN | undefined }
>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'communityGovernancePower'>> =>
  function Enhanced(props) {
    const communityGovernancePower = useVsrGovpower().data?.result

    // this `props as P` thing is annoying!! ts should know better -@asktree
    return (
      <Component
        {...(props as P)}
        communityGovernancePower={communityGovernancePower}
      />
    )
  } */

// TODO QV-2 Check if there is no plugin and get the vanilla value (or should the usePlugins hook have the vanilla value?)
export const useGovernancePower = (
  kind: 'community' | 'council' | undefined
) => {
  const { calculatedMaxVoterWeight } = useRealmVoterWeightPlugins(kind)
  return calculatedMaxVoterWeight?.value
}
/** deprecated: this should not be used any more. Use useRealmVoterWeightPlugins hook */
export const useGovernancePowerAsync = (
  kind: 'community' | 'council' | undefined
) => {
  const { totalCalculatedVoterWeight } = useRealmVoterWeightPlugins(kind)
  return totalCalculatedVoterWeight?.value;
}

/**
 * @deprecated
 * use useRealmVoterWeightPlugins instead
 */
export const useLegacyVoterWeight = () => {
  const communityPluginDetails = useRealmVoterWeightPlugins('community');
  const councilPluginDetails = useRealmVoterWeightPlugins('council');
  const ownVoterWeights = {
    community: communityPluginDetails.totalCalculatedVoterWeight?.value ?? undefined,
    council: councilPluginDetails.totalCalculatedVoterWeight?.value ?? undefined,
  }
  const { data: communityTOR } = useUserCommunityTokenOwnerRecord()
  const { data: councilTOR } = useUserCouncilTokenOwnerRecord()

  const voterWeight = new LegacyVoterWeightAdapter(ownVoterWeights, {
    community: communityTOR?.result,
    council: councilTOR?.result,
  });
  const ready = communityPluginDetails.isReady && councilPluginDetails.isReady;

  // only expose the vote weight once everything is loaded
  return { result: ready ? voterWeight : undefined, ready };
}
