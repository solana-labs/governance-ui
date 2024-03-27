import { PublicKey } from '@solana/web3.js'
import CommandLineInfo from '../../ComandLineInfo'

export default function ProgramUpgradeInfo({
  authority,
}: {
  authority: PublicKey | undefined
}) {
  if (!authority) {
    return null
  }

  return (
    <div className="border border-fgd-4 p-4 rounded-md">
      <div className="pb-3">
        <p className="mb-0.5 text-xs">Upgrade authority</p>
        <CommandLineInfo info={authority?.toBase58()} />
      </div>

      <div className="pb-3">
        <p className="mb-0.5 text-xs">Solana CLI</p>
        <CommandLineInfo info="solana program write-buffer <PROGRAM_FILEPATH>" />
      </div>
      <CommandLineInfo
        info={`solana program set-buffer-authority --new-buffer-authority ${authority?.toBase58()} <BUFFER_PUBKEY>`}
      />
    </div>
  )
}
