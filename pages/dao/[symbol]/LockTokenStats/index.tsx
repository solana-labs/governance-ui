import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { Deposit } from 'VoteStakeRegistry/sdk/accounts'

interface DepositWithWallet {
  voter: PublicKey
  wallet: PublicKey
  deposit: Deposit
}

const LockTokenStats = () => {
  const { realmInfo, realm } = useRealm()
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const voteStakeRegistryRegistrarPk = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrarPk
  )
  const voteStakeRegistryRegistrar = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrar
  )
  const [voters, setVoters] = useState<
    {
      publicKey: PublicKey
      account: any
    }[]
  >([])
  const [depositsWithWallets, setDepositsWithWallets] = useState<
    DepositWithWallet[]
  >([])
  useEffect(() => {
    const depositsWithWallets: DepositWithWallet[] = []
    for (const voter of voters) {
      const deposits = voter.account.deposits.filter(
        (x) =>
          x.isUsed &&
          typeof x.lockup?.kind.none === 'undefined' &&
          x.votingMintConfigIdx ===
            voteStakeRegistryRegistrar?.votingMints.findIndex(
              (votingMint) =>
                votingMint.mint.toBase58() ===
                realm?.account.communityMint.toBase58()
            )
      )
      for (const deposit of deposits) {
        const depositWithWallet = {
          voter: voter.publicKey,
          wallet: voter.account.voterAuthority,
          deposit: deposit,
        }
        depositsWithWallets.push(depositWithWallet)
      }
    }
    setDepositsWithWallets(
      depositsWithWallets.sort((a, b) =>
        b.deposit.amountDepositedNative
          .sub(a.deposit.amountDepositedNative)
          .toNumber()
      )
    )
  }, [voters.length])

  useEffect(() => {
    const getLockedDeposits = async () => {
      const allVoters = await vsrClient?.program.account.voter.all()
      const currentRealmVoters =
        allVoters?.filter(
          (x) =>
            x.account.registrar.toBase58() ===
            voteStakeRegistryRegistrarPk?.toBase58()
        ) || []
      console.log(currentRealmVoters)
      setVoters(currentRealmVoters)
    }

    getLockedDeposits()
  }, [
    vsrClient?.program.programId.toBase58(),
    voteStakeRegistryRegistrarPk?.toBase58(),
  ])

  return (
    <div className="bg-bkg-2 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="mb-4">
            <PreviousRouteBtn />
          </div>
          <div className="border-b border-fgd-4 flex flex-col md:flex-row justify-between pb-4">
            <div className="flex items-center mb-2 md:mb-0 py-2">
              {realmInfo?.ogImage ? (
                <img src={realmInfo?.ogImage} className="h-8 mr-3 w-8"></img>
              ) : null}
              <div>
                <p>{realmInfo?.displayName}</p>
                <h1 className="mb-0">Stats</h1>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex flex-col">
              {depositsWithWallets.map((x, index) => (
                <div key={index}>
                  <div>{x.wallet.toBase58()}</div>
                  {/* Monthly to vested map */}
                  <div>{Object.keys(x.deposit.lockup.kind)[0]}</div>
                  <div>{x.deposit.amountDepositedNative.toNumber()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockTokenStats
