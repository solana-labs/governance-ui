import {PublicKey} from "@solana/web3.js";
import {BN, Idl} from "@coral-xyz/anchor";
import {PluginName} from "@constants/plugins";
import {Client} from "@solana/governance-program-library";
import {RealmConfig} from "@solana/spl-governance";

export type PluginType = 'voterWeight' | 'maxVoterWeight'

export type UseVoterWeightPluginsArgs = {
    realmPublicKey?: PublicKey
    governanceMintPublicKey?: PublicKey
    walletPublicKeys?: PublicKey[],
    realmConfig?: RealmConfig
}

export type VoterWeightPluginInfo<TParams = unknown, TClient extends Idl = Idl> = {
    programId: PublicKey
    name: PluginName
    params: TParams
    type: PluginType
    weights: (BN | undefined)[] | undefined // the weight after applying this plugin
    registrarPublicKey: PublicKey
    client: Client<TClient>
}

export type VoterWeightPlugins = Record<PluginType, VoterWeightPluginInfo[]>

export type CalculatedWeight = {
    value: BN | null  // null means "something went wrong", if we are not still loading
    initialValue: BN | null // The initial voter weight, before any plugins were applied
    details: ({
        pluginName: PluginName
    } & ({
        pluginWeight: null
        error: Error
    }|{
        pluginWeight: BN
        error:  null
    }))[]
}

export interface useVoterWeightPluginReadinessReturnType {
    isReady: boolean //defines if the plugin is loading
    isEnabled: boolean //defines if the plugin is enabled in the realm
}