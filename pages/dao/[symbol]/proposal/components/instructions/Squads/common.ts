import { PublicKey } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'

export const MESH_PROGRAM_ID = new PublicKey(
  'SMPLVC8MxZ5Bf5EfF7PaMiTCxoBAcmkbM2vkrvMK8ho'
)

export interface MeshEditMemberForm {
  governedAccount: AssetAccount | null
  vault: string
  member: string
}
