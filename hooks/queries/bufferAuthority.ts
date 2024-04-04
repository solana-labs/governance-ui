import { BPF_UPGRADE_LOADER_ID } from "@solana/spl-governance";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query"
import { useRouteProposalQuery } from "./proposal";
import { useSelectedProposalTransactions } from "./proposalTransaction";

export const useBufferAccountsAuthority = () => {
    const {connection} = useConnection()
    const proposal = useRouteProposalQuery().data?.result
    const { data: transactions } = useSelectedProposalTransactions()
    const enabled = transactions !== undefined && proposal !== undefined;

    const query = useQuery({
        queryKey: enabled ?
            [connection.rpcEndpoint, 'BufferAccountsAuthority',proposal.pubkey]
            : undefined,

        queryFn: async() => {
            if (!enabled) throw new Error()
            const ixs = transactions.flatMap((pix) => pix.account.getAllInstructions())
            const bufAuthorities: PublicKey[] = [];
            
            for (let i = 0; i<ixs.length;i++) {
                const ix = ixs[i]

                if (ix.programId.equals(BPF_UPGRADE_LOADER_ID) && ix.data[0] === 3) {
                    const bufferAccountData = await connection.getAccountInfo(ix.accounts[2].pubkey);
                    
                    if (bufferAccountData && bufferAccountData.data.length > 36) {
                        bufAuthorities.push(new PublicKey(bufferAccountData.data.subarray(5,37)))
                    }
                }
            }
            
            return bufAuthorities
        },
        enabled
    })

    return query
}