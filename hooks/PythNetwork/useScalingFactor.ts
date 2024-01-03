import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { determineVotingPowerType } from "@hooks/queries/governancePower";
import { useRealmQuery } from "@hooks/queries/realm";
import { PythClient } from "@pythnetwork/staking";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAsync } from "react-async-hook";


export default function useScalingFactor() : number | undefined {
    const realm = useRealmQuery().data?.result
    const {connection} = useConnection()
    const { result: plugin } = useAsync(
        async () =>
        realm && determineVotingPowerType(connection, realm.pubkey, 'community'),
        [connection, realm]
      )

    const {result : scalingFactorResult } = useAsync(
        async () => {
        if (plugin !== 'pyth') {
            return 1
        }
        else if (plugin === 'pyth') {
            const pythClient = await PythClient.connect(connection, {} as NodeWallet)
            return pythClient.getScalingFactor()
        }
    },
        [connection, plugin]
      )
      return scalingFactorResult 
    
    }
    
