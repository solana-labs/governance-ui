import { useEffect, useState } from 'react'
import { Provider, Wallet } from '@project-serum/anchor'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import { getRegistrarPDA, Registrar } from 'VoteStakeRegistry/sdk/accounts'
import { tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { calcMultiplier } from 'VoteStakeRegistry/tools/deposits'
import { usePrevious } from '@hooks/usePrevious'

export function useVoteRegistry() {
  const { realm } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const previousWalletPk = usePrevious(wallet?.publicKey?.toBase58())
  const connection = useWalletStore((s) => s.connection)
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
        unlockedScaledFactor,
        lockupScaledFactor,
      } = mintCfg
      const depositScaledFactorNum = unlockedScaledFactor.toNumber()
      const lockupScaledFactorNum = lockupScaledFactor.toNumber()
      const lockupSaturationSecsNum = lockupSaturationSecs.toNumber()
      //(deposit_scaled_factor + lockup_scaled_factor * min(lockup_secs, lockup_saturation_secs) / lockup_saturation_secs) / deposit_scaled_factor
      const calced = calcMultiplier({
        depositScaledFactor: depositScaledFactorNum,
        lockupScaledFactor: lockupScaledFactorNum,
        lockupSaturationSecs: lockupSaturationSecsNum,
        lockupSecs,
      })

      return parseFloat(calced.toFixed(2))
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

    if (
      wallet?.connected &&
      wallet.publicKey?.toBase58() !== previousWalletPk
    ) {
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
      if (
        JSON.stringify(existingRegistrar) !==
        JSON.stringify(communityMintRegistrar)
      ) {
        setCommunityMintRegistrar(existingRegistrar)
      }
    }
    if (realm && client) {
      handleSetRegistrar()
    }
  }, [realm?.pubkey, client])

  return {
    client,
    calcMintMultiplier,
    communityMintRegistrar,
  }
}
