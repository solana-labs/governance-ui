import { PublicKey } from '@solana/web3.js'
import CommandLineInfo from '../../ComandLineInfo'

export default function ProgramUpgradeInfo({
  governancePk,
}: {
  governancePk: PublicKey | undefined
}) {
  if (!governancePk) {
    return null
  }

  return (
    <div className="text-sm mb-5">
      <div className="mb-2">Upgrade authority</div>

      <CommandLineInfo info={governancePk?.toBase58()}></CommandLineInfo>

      <div className="mb-2">Solana CLI</div>
      <CommandLineInfo info="solana program write-buffer <PROGRAM_FILEPATH>"></CommandLineInfo>
      <CommandLineInfo
        info={`solana program set-buffer-authority --new-buffer-authority ${governancePk?.toBase58()} <BUFFER_PUBKEY>`}
      ></CommandLineInfo>
    </div>
  )
}
