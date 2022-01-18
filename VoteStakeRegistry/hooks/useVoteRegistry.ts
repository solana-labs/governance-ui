import { useEffect, useState } from 'react'
import { Provider, Wallet } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import {
  getRegistrarPDA,
  Registrar,
  tryGetRegistrar,
} from 'VoteStakeRegistry/utils/voteRegistryTools'

export function useVoteRegistry() {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { realm } = useRealm()
  const [client, setClient] = useState<VsrClient>()
  const [
    communityMintRegistrar,
    setCommunityMintRegistrar,
  ] = useState<Registrar | null>(null)
  const calcMintMultiplier = (
    lockupSecs: number,
    registrar: Registrar | null
  ) => {
    const mintCfgs = registrar?.votingMints
    const mintCfg = mintCfgs?.find(
      (x) => x.mint.toBase58() === realm?.account.communityMint.toBase58()
    )
    if (mintCfg) {
      const {
        lockupSaturationSecs,
        depositScaledFactor,
        lockupScaledFactor,
      } = mintCfg
      const depositScaledFactorNum = depositScaledFactor.toNumber()
      const lockupScaledFactorNum = lockupScaledFactor.toNumber()
      const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()
      //(deposit_scaled_factor + lockup_scaled_factor * min(lockup_secs, lockup_saturation_secs) / lockup_saturation_secs) / deposit_scaled_factor
      const calc =
        (depositScaledFactorNum +
          (lockupScaledFactorNum *
            Math.min(lockupSecs, lockupSaturationSecsNum)) /
            lockupSaturationSecsNum) /
        depositScaledFactorNum

      return parseFloat(calc.toFixed(2))
    }
    return 0
  }

  useEffect(() => {
    const handleSetClient = async () => {
      const options = Provider.defaultOptions()
      const provider = new Provider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      setClient(vsrClient)
    }

    if (wallet?.connected) {
      handleSetClient()
    }
  }, [connection.endpoint, wallet?.connected])

  useEffect(() => {
    const handleSetRegistrar = async () => {
      const clientProgramId = client!.program.programId
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client!)
      setCommunityMintRegistrar(existingRegistrar)
    }
    if (realm?.pubkey && client) {
      handleSetRegistrar()
    }
  }, [realm?.pubkey, client])

  return {
    client,
    calcMintMultiplier,
    communityMintRegistrar,
  }
}
