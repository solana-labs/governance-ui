/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button from '@components/Button'
import Loading from '@components/Loading'
import NFTSelector from '@components/NFTS/NFTSelector'
import useRealm from '@hooks/useRealm'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { getVoterWeightRecord } from '@utils/plugin/accounts'

const NftBalanceCard = () => {
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  const connection = useWalletStore((s) => s.connection)
  const { tokenRecords, realm, realmInfo } = useRealm()
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const ownTokenRecord = wallet?.publicKey
    ? tokenRecords[wallet.publicKey!.toBase58()]
    : null
  const handleRegister = async () => {
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    const createVoterWeightRecordIx = await (client.client as NftVoterClient).program.methods
      .createVoterWeightRecord(wallet!.publicKey!)
      .accounts({
        voterWeightRecord: voterWeightPk,
        governanceProgramId: realm!.owner,
        realm: realm!.pubkey,
        realmGoverningTokenMint: realm!.account.communityMint,
        payer: wallet!.publicKey!,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .instruction()
    instructions.push(createVoterWeightRecordIx)
    await withCreateTokenOwnerRecord(
      instructions,
      realm!.owner!,
      realmInfo?.programVersion!,
      realm!.pubkey,
      wallet!.publicKey!,
      realm!.account.communityMint,
      wallet!.publicKey!
    )
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection: connection.current,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
    await fetchRealm(realm?.owner, realm?.pubkey)
  }

  return (
    <div className="py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-0">Your NFTS</h3>
      </div>
      <div className="space-y-4">
        {!connected ? (
          <div className="p-3 text-xs bg-bkg-3">Please connect your wallet</div>
        ) : !isLoading ? (
          <NFTSelector
            onNftSelect={() => {
              return null
            }}
            ownersPk={[wallet!.publicKey!]}
            nftHeight="50px"
            nftWidth="50px"
            selectable={false}
            predefinedNfts={nfts}
          ></NFTSelector>
        ) : (
          <Loading></Loading>
        )}
      </div>
      {connected && !ownTokenRecord && (
        <Button className="w-full" onClick={handleRegister}>
          Join
        </Button>
      )}
    </div>
  )
}
export default NftBalanceCard
