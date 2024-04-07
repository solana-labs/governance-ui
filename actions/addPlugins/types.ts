import {PublicKey, TransactionInstruction} from "@solana/web3.js";

export type AddPluginResult = {
    pluginProgramId: PublicKey,
    instructions: TransactionInstruction[]
}