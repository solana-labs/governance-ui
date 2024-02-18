import Button from '@components/Button'
import Loading from '@components/Loading'
import { GatewayButton } from '@components/Gateway/GatewayButton'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {useGatewayVoterWeightPlugin} from "../../VoterWeightPlugins";
import {useJoinRealm} from "@hooks/useJoinRealm";
import {useConnection} from "@solana/wallet-adapter-react";
import {Transaction} from "@solana/web3.js";
import {sendTransaction} from "@utils/send";

const GatewayCard = () => {
    const wallet = useWalletOnePointOh()
    const connected = !!wallet?.connected
    const {connection} = useConnection();
    const { gatekeeperNetwork, isReady, isEnabled } = useGatewayVoterWeightPlugin();
    const { userNeedsTokenOwnerRecord, handleRegister } = useJoinRealm();

    // TODO [CT] join button should no longer be related to the gateway plugin
    // this,a nd handle register can both be removed from here.
    // the generic join button should call handleRegister from useJoinRealm, which will
    // call the relevant instructions for all plugins
    const showJoinButton = userNeedsTokenOwnerRecord;

    const join = async () => {
        const instructions = await handleRegister();
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
            {connected && showJoinButton && (
                <Button className="w-full" onClick={join}>
                    Join
                </Button>
            )}
        </div>
    )
}
export default GatewayCard
