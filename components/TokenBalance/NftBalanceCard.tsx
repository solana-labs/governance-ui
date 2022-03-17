import Button from '@components/Button'
import NFTSelector from '@components/NFTS/NFTSelector'
import useRealm from '@hooks/useRealm'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import { NFTWithMint } from '@utils/uiTypes/nfts'
import { getNftVoterWeightRecord } from 'NftVotePlugin/sdk/accounts'
import { useEffect, useState } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'

const NftBalanceCard = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [nfts, setNfts] = useState<NFTWithMint[]>([])
  const votingNfts = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient.votingNfts
  )
  const connection = useWalletStore((s) => s.connection)
  const { tokenRecords, realm } = useRealm()
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const ownTokenRecord = wallet?.publicKey
    ? tokenRecords[wallet.publicKey!.toBase58()]
    : null
  const handleRegister = async () => {
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getNftVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    instructions.push(
      (client.client as NftVoterClient).program.instruction.createVoterWeightRecord(
        wallet!.publicKey!,
        {
          accounts: {
            voterWeightRecord: voterWeightPk,
            governanceProgramId: realm!.owner,
            realm: realm!.pubkey,
            realmGoverningTokenMint: realm!.account.communityMint,
            payer: wallet!.publicKey!,
            systemProgram: SYSTEM_PROGRAM_ID,
          },
        }
      )
    )
    await withCreateTokenOwnerRecord(
      instructions,
      realm!.owner!,
      realm!.pubkey,
      wallet!.publicKey!,
      realm!.account.communityMint,
      wallet!.publicKey!
    )
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet,
      connection: connection.current,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
    await fetchRealm(realm?.owner, realm?.pubkey)
  }
  useEffect(() => {
    console.log(votingNfts, '@#$#@$#@$$#')
    if (votingNfts) {
      setNfts(votingNfts)
    } else {
      setNfts([])
    }
  }, [votingNfts, wallet?.connected])

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Your NFTS</h3>
      <div className="space-y-4">
        {!connected ? (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        ) : (
          <NFTSelector
            onNftSelect={() => {
              return null
            }}
            ownerPk={wallet!.publicKey!}
            nftHeight="50px"
            nftWidth="50px"
            selectable={false}
            predefinedNfts={nfts}
          ></NFTSelector>
        )}
      </div>
      {connected && !ownTokenRecord && (
        <Button className="w-full" onClick={handleRegister}>
          Register
        </Button>
      )}
    </div>
  )
}
export default NftBalanceCard
