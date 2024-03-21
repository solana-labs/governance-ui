import Loading from '@components/Loading'
import { GatewayButton } from '@components/Gateway/GatewayButton'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {useGatewayVoterWeightPlugin} from "../../VoterWeightPlugins";

const GatewayCard = () => {
    const wallet = useWalletOnePointOh()
    const connected = !!wallet?.connected
    const { gatekeeperNetwork, isReady, isEnabled } = useGatewayVoterWeightPlugin();

    return (
        <div className="bg-bkg-2 pt-4 md:pt-6 rounded-lg">
            <div className="space-y-4">
                {!connected && (
                    <div className="text-xs bg-bkg-3 p-3">Please connect your wallet</div>
                )}
                {isEnabled && !isReady && <Loading></Loading>}
                {isEnabled && isReady &&
                    connected &&
                    wallet &&
                    wallet.publicKey &&
                    gatekeeperNetwork && <GatewayButton />}
            </div>
        </div>
    )
}
export default GatewayCard
