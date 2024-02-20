import Button from '@components/Button'
import Loading from '@components/Loading'
import { GatewayButton } from '@components/Gateway/GatewayButton'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import Modal from '@components/Modal'
import { InformationCircleIcon } from '@heroicons/react/solid'
import { useGatewayVoterWeightPlugin } from '../../VoterWeightPlugins'
import { useJoinRealm } from '@hooks/useJoinRealm'
import { useConnection } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'

const GatewayCard = () => {
  // const wallet = useWalletOnePointOh()
  // const connected = !!wallet?.connected
  // const client = useVotePluginsClientStore(
  //   (s) => s.state.currentRealmVotingClient
  // )
  // const gatekeeperNetwork = useGatewayPluginStore(
  //   (s) => s.state.gatekeeperNetwork
  // )
  // const [showGatewayModal, setShowGatewayModal] = useState(false)
  // const isLoading = useGatewayPluginStore((s) => s.state.isLoadingGatewayToken)
  // const connection = useLegacyConnectionContext()
  // const [, setTokenOwneRecordPk] = useState('') //@asktree: ?????????????????????????????????????????
  // const realm = useRealmQuery().data?.result
  // const mint = useRealmCommunityMintInfoQuery().data?.result
  // const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { connection } = useConnection()
  const {
    gatekeeperNetwork,
    isReady,
    isEnabled,
  } = useGatewayVoterWeightPlugin()
  const {
    userNeedsTokenOwnerRecord,
    userNeedsVoterWeightRecords,
    handleRegister,
  } = useJoinRealm()

  // TODO [CT] join button should no longer be related to the gateway plugin
  // this,a nd handle register can both be removed from here.
  // the generic join button should call handleRegister from useJoinRealm, which will
  // call the relevant instructions for all plugins
  const showJoinButton =
    userNeedsTokenOwnerRecord || userNeedsVoterWeightRecords

  const join = async () => {
    const instructions = await handleRegister()
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
  }

  //   await sendTransaction({
  //     transaction: transaction,
  //     wallet: wallet!,
  //     connection: connection.current,
  //     signers: [],
  //     sendingMessage: `Registering`,
  //     successMessage: `Registered`,
  //   })
  // }

  // useEffect(() => {
  //   const getTokenOwnerRecord = async () => {
  //     const defaultMint = !mint?.supply.isZero()
  //       ? realm!.account.communityMint
  //       : !councilMint?.supply.isZero()
  //       ? realm!.account.config.councilMint
  //       : undefined
  //     const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
  //       realm!.owner,
  //       realm!.pubkey,
  //       defaultMint!,
  //       wallet!.publicKey!
  //     )
  //     setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
  //   }
  //   if (realm && wallet?.connected) {
  //     getTokenOwnerRecord()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  // }, [realm?.pubkey.toBase58(), wallet?.connected])

  // console.log('rendering gateway card')

  // return (
  //   <div className="bg-bkg-2 md:pt-6 rounded-lg">
  //     <div className="flex items-center">
  //       <h3 className="mb-1">Verify to Vote</h3>
  //       <span>
  //         <InformationCircleIcon
  //           className="w-5 h-5 ml-1 mb-1 cursor-pointer"
  //           onClick={() => setShowGatewayModal(true)}
  //         />
  //       </span>
  //     </div>
  //     <div className="space-y-4">
  //       {!connected && (
  //         <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
  //       )}
  //       {isLoading && <Loading></Loading>}
  //       {!isLoading &&
  //         connected &&
  //         wallet &&
  //         wallet.publicKey &&
  //         gatekeeperNetwork && <GatewayButton />}
  //     </div>
  //     <p className="text-fgd-3 mt-2">
  //       Verify your personhood with Civic Pass to vote.
  //     </p>
  //     {connected && showJoinButton && (
  //       <Button className="w-full mt-4" onClick={handleRegister}>
  //         Join
  //       </Button>
  //     )}
  //     {showGatewayModal && (
  //       <Modal
  //         sizeClassName="sm:max-w-3xl"
  //         onClose={() => setShowGatewayModal(false)}
  //         isOpen={showGatewayModal}
  //       >
  //         <div className="p-4">
  //           <h1 className="text-center mb-8"> Verify to Vote</h1>
  //           <div className="flex justify-start items-start mb-6">
  //             <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
  //               <span>1</span>
  //             </div>
  //             <div>
  //               <h2>Connect Governance Wallet</h2>
  //               <div>
  //                 Connect the wallet with your governance token(s). Consolidate
  //                 multiple tokens into one wallet before voting.
  //               </div>
  //             </div>
  //           </div>
  //           <div className="flex justify-start items-start mb-6">
  //             <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
  //               <span>2</span>
  //             </div>
  //             <div>
  //               <h2>Verify Identity</h2>
  //               <div>
  //                 Verify yourself using Civic Pass to prevent voting abuse.
  //               </div>
  //             </div>
  //           </div>
  //           <div className="flex justify-start items-start mb-6">
  //             <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
  //               <span>3</span>
  //             </div>
  //             <div>
  //               <h3>Vote</h3>
  //               <div>
  //                 Connect the wallet with your governance token(s). Consolidate
  //                 multiple tokens into one wallet before voting.
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </Modal>
  //     )}
  //   </div>
  // )
  return (
    <div className="bg-bkg-2 pt-4 md:pt-6 rounded-lg">
      <div className="space-y-4">
        {!connected && (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        )}
        {isEnabled && !isReady && <Loading></Loading>}
        {isEnabled &&
          isReady &&
          connected &&
          wallet &&
          wallet.publicKey &&
          gatekeeperNetwork && <GatewayButton />}
      </div>
      {connected && showJoinButton && (
        <Button className="w-full" onClick={join}>
          Join
        </Button>
      )}
    </div>
  )
}
export default GatewayCard
