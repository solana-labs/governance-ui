/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Button from '@components/Button'
import Loading from '@components/Loading'
import useRealm from '@hooks/useRealm'
import { GatewayClient } from '@solana/governance-program-library'
import {
  getTokenOwnerRecordAddress,
  SYSTEM_PROGRAM_ID,
  withCreateTokenOwnerRecord,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import { useState, useEffect, useMemo } from 'react'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useGatewayPluginStore from '../../GatewayPlugin/store/gatewayPluginStore'
import { GatewayButton } from '@components/Gateway/GatewayButton'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'
import { useRecords } from '@components/Gateway/useRecords'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import Modal from '@components/Modal'
import { InformationCircleIcon } from '@heroicons/react/outline'

// TODO lots of overlap with NftBalanceCard here - we need to separate the logic for creating the Token Owner Record
// from the rest of this logic
const GatewayCard = () => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const gatekeeperNetwork = useGatewayPluginStore(
    (s) => s.state.gatekeeperNetwork
  )
  const [showGatewayModal, setShowGatewayModal] = useState(false)
  const isLoading = useGatewayPluginStore((s) => s.state.isLoadingGatewayToken)
  const connection = useLegacyConnectionContext()
  const [, setTokenOwneRecordPk] = useState('') //@asktree: ?????????????????????????????????????????
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result

  const { realmInfo } = useRealm()
  const records = useRecords()

  // show the join button if any of the records required by the chain of plugins are not yet created
  const showJoinButton = useMemo(() => {
    return (
      (!records.tokenOwnerRecord.accountExists &&
        records.tokenOwnerRecord.accountRequired) ||
      (!records.voteWeightRecord.accountExists &&
        records.voteWeightRecord.accountRequired)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [records, client])

  const handleRegister = async () => {
    const instructions: TransactionInstruction[] = []
    const { voterWeightPk } = await getVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    const { registrar } = await getRegistrarPDA(
      realm!.pubkey,
      realm!.account.communityMint,
      client.client!.program.programId
    )
    // If a vote weight record is needed (i.e. the realm has a voter weight plugin)
    // but doesn't exist yet, add the instruction to create it to the list
    if (
      !records.voteWeightRecord.accountExists &&
      records.voteWeightRecord.accountRequired
    ) {
      const createVoterWeightRecordIx = await (client.client as GatewayClient).program.methods
        .createVoterWeightRecord(wallet!.publicKey!)
        .accounts({
          voterWeightRecord: voterWeightPk,
          registrar,
          payer: wallet!.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()

      instructions.push(createVoterWeightRecordIx)
    }

    // If a token owner record doesn't exist yet,
    // add the instruction to create it to the list
    if (
      !records.tokenOwnerRecord.accountExists &&
      records.tokenOwnerRecord.accountRequired
    ) {
      await withCreateTokenOwnerRecord(
        instructions,
        realm!.owner!,
        realmInfo?.programVersion!,
        realm!.pubkey,
        wallet!.publicKey!,
        realm!.account.communityMint,
        wallet!.publicKey!
      )
    }
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
  }

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint = !mint?.supply.isZero()
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
    <div className="bg-bkg-2 md:pt-6 rounded-lg">
      <div className="flex items-center">
        <h3 className="mb-1">Verify to Vote</h3>
        <span>
          <InformationCircleIcon
            className="w-5 h-5 ml-1 mb-1 cursor-pointer"
            onClick={() => setShowGatewayModal(true)}
          />
        </span>
      </div>
      <div className="space-y-4">
        {!connected && (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        )}
        {isLoading && <Loading></Loading>}
        {!isLoading &&
          connected &&
          wallet &&
          wallet.publicKey &&
          gatekeeperNetwork && <GatewayButton />}
      </div>
      <p className="text-fgd-3 mt-2">
        Verify your personhood with Civic Pass to vote.
      </p>
      {/* {connected && showJoinButton && (
        <Button className="w-full" onClick={handleRegister}>
          Join
        </Button>
      )} */}
      {showGatewayModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => setShowGatewayModal(false)}
          isOpen={showGatewayModal}
        >
          <div className="p-4">
            <h1 className="text-center mb-8"> Verify to Vote</h1>
            <div className="flex justify-start items-start mb-6">
              <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
                <span>1</span>
              </div>
              <div>
                <h2>Connect Governance Wallet</h2>
                <div>
                  Connect the wallet with your governance token(s). Consolidate
                  multiple tokens into one wallet before voting.
                </div>
              </div>
            </div>
            <div className="flex justify-start items-start mb-6">
              <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
                <span>2</span>
              </div>
              <div>
                <h2>Verify Identity</h2>
                <div>
                  Verify yourself using Civic Pass to prevent voting abuse.
                </div>
              </div>
            </div>
            <div className="flex justify-start items-start mb-6">
              <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
                <span>3</span>
              </div>
              <div>
                <h3>Vote</h3>
                <div>
                  Connect the wallet with your governance token(s). Consolidate
                  multiple tokens into one wallet before voting.
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default GatewayCard
