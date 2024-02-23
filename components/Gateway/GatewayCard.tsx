import Loading from '@components/Loading'
import { GatewayButton } from '@components/Gateway/GatewayButton'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useState } from 'react'
import Modal from '@components/Modal'
import { InformationCircleIcon } from '@heroicons/react/solid'
import { useGatewayVoterWeightPlugin } from '../../VoterWeightPlugins'
import { useJoinRealm } from '@hooks/useJoinRealm'
import { useConnection } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import Button from '@components/Button'

const GatewayCard = () => {
  const [showGatewayModal, setShowGatewayModal] = useState(false)
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

  return (
    <div className="bg-bkg-2 py-3 rounded-lg">
      <div className="space-y-1">
        {!connected && (
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        )}

        <div className="flex items-center">
          <h3>Verify to Vote</h3>
          <span>
            <InformationCircleIcon
              className="w-5 h-5 ml-1 mb-1 cursor-pointer"
              onClick={() => setShowGatewayModal(true)}
            />
          </span>
        </div>
        <div className="space-y-1">
          {!connected && (
            <div className="text-xs bg-bkg-3 p-3">
              Please connect your wallet
            </div>
          )}
        </div>
        {isEnabled && !isReady && <Loading></Loading>}
        {isEnabled &&
          isReady &&
          connected &&
          wallet &&
          wallet.publicKey &&
          gatekeeperNetwork && <GatewayButton />}
      </div>
      {connected && showJoinButton && (
        <Button className="w-full mt-2" onClick={join}>
          Join
        </Button>
      )}

      <p className="text-fgd-3 mt-2">
        Verify your personhood with Civic Pass to vote.
      </p>

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
