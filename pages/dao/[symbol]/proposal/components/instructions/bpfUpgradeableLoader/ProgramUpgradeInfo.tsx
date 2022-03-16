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
    <div className="border border-fgd-4 p-4 rounded-md">
      <div className="pb-3">
        <p className="mb-0.5 text-xs">Upgrade authority</p>
        <CommandLineInfo info={governancePk?.toBase58()} />
      </div>

      <div className="pb-3">
        <p className="mb-0.5 text-xs">Solana CLI</p>
        <CommandLineInfo info="solana program write-buffer <PROGRAM_FILEPATH>" />
      </div>
      <CommandLineInfo
        info={`solana program set-buffer-authority --new-buffer-authority ${governancePk?.toBase58()} <BUFFER_PUBKEY>`}
      />
    </div>
  )
}
