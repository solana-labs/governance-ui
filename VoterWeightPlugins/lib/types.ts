import {PublicKey} from "@solana/web3.js";
import {BN, Idl} from "@coral-xyz/anchor";
import {PluginName} from "@constants/plugins";
import {Client} from "@solana/governance-program-library";

export type UseVoterWeightPluginsArgs = {
    realmPublicKey?: PublicKey
    governanceMintPublicKey?: PublicKey
    walletPublicKey?: PublicKey
}

export type VoterWeightPluginInfo<TParams = unknown, TClient extends Idl = Idl> = {
    programId: PublicKey
    name: PluginName | undefined // you need undefined here to allow "unknown" plugins
    params: TParams
    voterWeight: BN | undefined // the weight after applying this plugin (taken from the voter's voterWeightRecord account)
    maxVoterWeight: BN | undefined // see above - can be undefined if the plugin does not set a max voter weight
    registrarPublicKey: PublicKey
    client: Client<TClient>
}

export type CalculatedWeight = {
    voterWeight: BN | null  // null means "something went wrong", if we are not still loading
    details: {
        pluginName: PluginName
        pluginWeight: BN | null
        error: Error | null
    }[]
}

export interface useVoterWeightPluginReadinessReturnType {
    isReady: boolean //defines if the plugin is loading
    isEnabled: boolean //defines if the plugin is enabled in the realm
}