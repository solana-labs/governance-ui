import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import tokenService from '@utils/services/token'
import VoteResultsBar from '@components/VoteResultsBar'
import {
  StreamClient,
  ClusterExtended,
  Cluster,
  getNumberFromBN,
  cancelStreamInstruction,
} from '@streamflow/stream'
import Button from '@components/Button'

import { serializeInstructionToBase64 } from '@solana/spl-governance'

import useWalletStore from 'stores/useWalletStore'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import useRealm from '@hooks/useRealm'
import { useState } from 'react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

import { STREAMFLOW_PROGRAM_ID } from 'pages/dao/[symbol]/proposal/components/instructions/Streamflow/CreateStream'

const getCluster = (name: string): ClusterExtended => {
  if (name == 'devnet') {
    return Cluster.Devnet
  } else {
    return Cluster.Mainnet
  }
}

export interface TokenMintMetadata {
  readonly decimals: number
  readonly symbol: string
}

// Mint metadata for Well known tokens displayed on the instruction card
export const MINT_METADATA = {
  Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj: { symbol: 'STRM', decimals: 9 },
}

export function getMintMetadata(
  tokenMintPk: PublicKey | undefined
): TokenMintMetadata {
  const tokenMintAddress = tokenMintPk ? tokenMintPk.toBase58() : ''
  const tokenInfo = tokenMintAddress
    ? tokenService.getTokenInfo(tokenMintAddress)
    : null
  return tokenInfo
    ? {
        name: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        address: tokenInfo.address,
      }
    : MINT_METADATA[tokenMintAddress]
}

export const STREAMFLOW_INSTRUCTIONS = {
  DcAwL38mreGvUyykD2iitqcgu9hpFbtzxfaGpLi72kfY: {
    174: {
      name: 'Streamflow: Create',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Token account', important: true },
        { name: 'Authority' },
        { name: 'Authority' },
        { name: 'Liquidator' },
        { name: 'Mint' },
        { name: 'Streamflow treasury' },
      ],
      getDataUI: async (
        connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        // const router = useRouter()
        // const { realm, mint, realmInfo, symbol } = useRealm()
        // const { assetAccounts } = useGovernanceAssets()

        // const { fmtUrlWithCluster } = useQueryContext()
        // const wallet = useWalletStore((s) => s.current)
        // const { handleCreateProposal } = useCreateProposal()
        // const [voteByCouncil, setVoteByCouncil] = useState(false)
        // const defaultCancelTitle = 'Cancel streamflow contract'
        // const [creatingProposal, setCreatingProposal] = useState(false)

        try {
          const cli = new StreamClient(
            connection.rpcEndpoint,
            Cluster.Devnet, //add option to client to attach connection
            undefined,
            accounts[0].pubkey.toBase58()
          )
          const contract_metadata = accounts[2].pubkey
          const stream = await cli.getOne(contract_metadata.toBase58())
          const creator_governance = new PublicKey(stream.sender)
          console.log(stream.mint)
          const decimals = getMintMetadata(new PublicKey(stream.mint)).decimals
          const start = stream.start
          const amountDeposited = getNumberFromBN(
            stream.depositedAmount,
            decimals
          )
          const releaseFrequency = stream.period
          const releaseAmount = getNumberFromBN(
            stream.amountPerPeriod,
            decimals
          )
          const amountAtCliff = getNumberFromBN(stream.cliffAmount, decimals)

          let unlockedPercent = 0
          const unlocked = stream.unlocked(
            new Date().getTime() / 1000,
            decimals
          )
          unlockedPercent = Math.round((unlocked / amountDeposited) * 100)

          // const handleCreate = async () => {
          //   let serializedInstruction = ''
          //   if (wallet?.publicKey && realm) {
          //     setCreatingProposal(true)
          //     const cancelStreamAccounts = {
          //       authority: creator_governance,
          //       sender: creator_governance,
          //       senderTokens: new PublicKey(stream.senderTokens),
          //       recipient: new PublicKey(stream.recipient),
          //       recipientTokens: new PublicKey(stream.recipientTokens),
          //       metadata: new PublicKey(contract_metadata),
          //       escrowTokens: new PublicKey(stream.escrowTokens),
          //       streamflowTreasury: new PublicKey(stream.streamflowTreasury),
          //       streamflowTreasuryTokens: new PublicKey(
          //         stream.streamflowTreasuryTokens
          //       ),
          //       partner: new PublicKey(stream.partner),
          //       partnerTokens: new PublicKey(stream.partnerTokens),
          //       mint: new PublicKey(stream.mint),
          //       tokenProgram: new PublicKey(TOKEN_PROGRAM_ID),
          //       systemProgram: SystemProgram.programId,
          //     }
          //     const instruction = cancelStreamInstruction(
          //       new PublicKey(STREAMFLOW_PROGRAM_ID),
          //       cancelStreamAccounts
          //     )
          //     const governance = assetAccounts.find(
          //       (account) => account.pubkey === creator_governance
          //     )?.governance
          //     serializedInstruction = serializeInstructionToBase64(instruction)
          //     const obj: UiInstruction = {
          //       serializedInstruction: serializedInstruction,
          //       isValid: true,
          //       governance,
          //     }
          //     const instructionData = new InstructionDataWithHoldUpTime({
          //       instruction: obj,
          //       governance,
          //     })
          //     try {
          //       const proposalAddress = await handleCreateProposal({
          //         title: defaultCancelTitle,
          //         description: '',
          //         voteByCouncil,
          //         instructionsData: [instructionData],
          //         governance: governance!,
          //       })
          //       const url = fmtUrlWithCluster(
          //         `/dao/${symbol}/proposal/${proposalAddress}`
          //       )
          //       router.push(url)
          //     } catch (ex) {
          //       notify({ type: 'error', message: `${ex}` })
          //     }
          //     setCreatingProposal(false)
          //   }
          // }

          return (
            <>
              <div>
                <div>
                  <span>Start:</span>
                  <span> {new Date(start * 1000).toISOString()} UTC</span>
                </div>

                <div>
                  <span>Amount:</span>
                  <span> {amountDeposited}</span>
                </div>
                <div>
                  <span>Unlocked every:</span>
                  <span> {releaseFrequency} seconds</span>
                </div>
                <div>
                  <span>Release amount:</span>
                  <span> {releaseAmount}</span>
                </div>
                <div>
                  <span>Released at start:</span>
                  <span> {amountAtCliff}</span>
                </div>
                <br></br>
                <div>
                  <span>Unlocked:</span>
                  <VoteResultsBar
                    approveVotePercentage={unlockedPercent}
                    denyVotePercentage={0}
                  />
                </div>
                <br></br>
                {/* <Button onClick={}>Cancel</Button> */}
                <Button>Cancel</Button>
              </div>
            </>
          )
        } catch (error) {
          console.log('HEEEEYOOOOO')
          console.log(error)
          return <></>
        }
      },
    },
  },
}
