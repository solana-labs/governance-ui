/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button from '@components/Button'
import Loading from '@components/Loading'
import NFTSelector from '@components/NFTS/NFTSelector'
import useRealm from '@hooks/useRealm'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import {
  getTokenOwnerRecordAddress,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { getVoterWeightRecord } from '@utils/plugin/accounts'
import { FC, useEffect, useState } from 'react'
import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/outline'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

interface Props {
  inAccountDetails?: boolean
  showView?: boolean
}

const NftBalanceCard = ({ inAccountDetails, showView }: Props) => {
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const isLoading = useNftPluginStore((s) => s.state.isLoadingNfts)
  const connection = useWalletStore((s) => s.connection)
  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const {
    tokenRecords,
    realm,
    symbol,
    mint,
    councilMint,
    config,
    realmInfo,
  } = useRealm()
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

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint =
        !mint?.supply.isZero() ||
        config?.account.communityTokenConfig.maxVoterWeightAddin
          ? realm!.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm!.account.config.councilMint
          : undefined
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        wallet!.publicKey!
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realm?.pubkey.toBase58(), wallet?.connected])

  return (
    <Wrapper inAccountDetails={inAccountDetails}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-0">Your NFTS</h3>
        {showView && (
          <Link
            href={fmtUrlWithCluster(
              `/dao/${symbol}/account/${tokenOwnerRecordPk}`
            )}
          >
            <a
              className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
                !connected || !tokenOwnerRecordPk
                  ? 'opacity-50 pointer-events-none'
                  : ''
              }`}
            >
              View
              <ChevronRightIcon className="flex-shrink-0 w-6 h-6" />
            </a>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {!connected ? (
          <div className={'text-xs text-white/50 mt-4'}>
            Connect your wallet to see your NFTs
          </div>
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
    </Wrapper>
  )
}

const Wrapper: FC<Props> = ({ children, inAccountDetails }) => {
  if (inAccountDetails) {
    return <div className="space-y-4 w-1/2">{children}</div>
  } else {
    return <>{children}</>
  }
}

export default NftBalanceCard
