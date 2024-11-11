import { GatewayButton } from '@components/Gateway/GatewayButton'
import Modal from '@components/Modal'
import { InformationCircleIcon } from '@heroicons/react/solid'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useState } from 'react'
import { useGatewayVoterWeightPlugin } from '../../VoterWeightPlugins'
import {
  useRealmVoterWeightPlugins,
  useRealmVoterWeights,
} from '@hooks/useRealmVoterWeightPlugins'
import { BN } from '@coral-xyz/anchor'
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react'
import useUserGovTokenAccountQuery from '@hooks/useUserGovTokenAccount'
import BigNumber from 'bignumber.js'
import PluginVotingPower from '@components/ProposalVotingPower/PluginVotingPower'

interface Props {
  role: 'community' | 'council'
}

const GatewayCard = ({ role }: Props) => {
  const [showGatewayModal, setShowGatewayModal] = useState(false)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { gatewayStatus } = useGateway()

  const {
    gatekeeperNetwork,
    isReady,
    isEnabled,
  } = useGatewayVoterWeightPlugin()
  const { communityWeight, councilWeight } = useRealmVoterWeights()

  const { plugins } = useRealmVoterWeightPlugins(role)

  const userAta = useUserGovTokenAccountQuery('community').data?.result
  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0)

  const hasTokens =
    depositAmount.isGreaterThan(0) ||
    councilWeight?.value?.gt(new BN(0)) ||
    communityWeight?.value?.gt(new BN(0))

  if (!connected) {
    return (
      <div className="bg-bkg-2 py-3 rounded-lg">
        <div className="space-y-1">
          <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
        </div>
      </div>
    )
  }
  if (hasTokens) {
    return (
      <div className="bg-bkg-2 py-3 rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center">
            <h3>Verify to vote</h3>
            <span>
              <InformationCircleIcon
                className="w-5 h-5 ml-1 mb-1 cursor-pointer"
                onClick={() => setShowGatewayModal(true)}
              />
            </span>
          </div>
          {isEnabled &&
            isReady &&
            wallet &&
            wallet.publicKey &&
            gatekeeperNetwork &&
            hasTokens && <GatewayButton />}
        </div>
        <p className="text-fgd-3 mt-2">
          {gatewayStatus === GatewayStatus.ACTIVE
            ? 'You are approved to vote'
            : 'Verify your personhood with Civic Pass to vote.'}
        </p>
        {
          // check if the last plugin is gateway to show the voting power
          plugins?.voterWeight[plugins.voterWeight.length - 1].name ===
            'gateway' && <PluginVotingPower role={role} />
        }
        {showGatewayModal && (
          <Modal
            sizeClassName="sm:max-w-3xl"
            onClose={() => setShowGatewayModal(false)}
            isOpen={showGatewayModal}
          >
            <div className="p-4">
              <h1 className="text-center mb-8">Verify to vote</h1>
              <div className="flex justify-start items-start mb-6">
                <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
                  <span>1</span>
                </div>
                <div>
                  <h2>Connect Governance Wallet</h2>
                  <div>
                    Connect the wallet with your governance token(s).
                    Consolidate multiple tokens into one wallet before voting.
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
                    Verify your identity using Civic Pass to prevent voting
                    abuse, such as Sybil attacks.
                  </div>
                </div>
              </div>
              <div className="flex justify-start items-start mb-6">
                <div className="min-w-[32px] min-h-[32px] border-solid border-[1px] border-gray-400 mr-3 rounded-full flex items-center justify-center">
                  <span>3</span>
                </div>
                <div>
                  <h3>Vote</h3>
                  <div>Vote with confidence in a fair system.</div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }
  return null
}
export default GatewayCard
