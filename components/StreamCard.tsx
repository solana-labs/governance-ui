import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import tokenService from '@utils/services/token'

import {
  StreamClient,
  Cluster,
  cancelStreamInstruction,
  Stream,
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
import { useEffect, useState } from 'react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

import { STREAMFLOW_PROGRAM_ID } from 'pages/dao/[symbol]/proposal/components/instructions/Streamflow/CreateStream'

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

export default function StreamCard({
  connection,
  accounts,
}: {
  connection: Connection
  accounts: AccountMetaData[]
}) {
  const router = useRouter()
  const { realm, symbol } = useRealm()
  const { assetAccounts } = useGovernanceAssets()

  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const { handleCreateProposal } = useCreateProposal()
  const [voteByCouncil] = useState(false)
  const defaultCancelTitle = 'Cancel streamflow contract'
  const [creatingProposal, setCreatingProposal] = useState(false)

  const [stream, setStream] = useState<Stream>()

  const hasExplicitPayer = accounts.length === 12
  const metadataIndex = hasExplicitPayer ? 3 : 2

  useEffect(() => {
    async function fetch() {
      const cli = new StreamClient(
        connection.rpcEndpoint,
        Cluster.Devnet,
        undefined,
        accounts[0].pubkey.toBase58()
      )
      const contract_metadata = accounts[metadataIndex].pubkey
      const stream = await cli.getOne(contract_metadata.toBase58())
      setStream(stream)
    }
    if (!stream) {
      fetch()
    }
  })

  const contract_metadata = accounts[metadataIndex].pubkey
  if (stream?.createdAt == 0 || !stream?.cancelableBySender) {
    return <></>
  }
  const creator_governance = new PublicKey(stream.sender)

  const handleCancel = async () => {
    let serializedInstruction = ''
    if (wallet?.publicKey && realm) {
      setCreatingProposal(true)
      const cancelStreamAccounts = {
        authority: creator_governance,
        sender: creator_governance,
        senderTokens: new PublicKey(stream.senderTokens),
        recipient: new PublicKey(stream.recipient),
        recipientTokens: new PublicKey(stream.recipientTokens),
        metadata: new PublicKey(contract_metadata),
        escrowTokens: new PublicKey(stream.escrowTokens),
        streamflowTreasury: new PublicKey(stream.streamflowTreasury),
        streamflowTreasuryTokens: new PublicKey(
          stream.streamflowTreasuryTokens
        ),
        partner: new PublicKey(stream.partner),
        partnerTokens: new PublicKey(stream.partnerTokens),
        mint: new PublicKey(stream.mint),
        tokenProgram: new PublicKey(TOKEN_PROGRAM_ID),
        systemProgram: SystemProgram.programId,
      }
      const instruction = cancelStreamInstruction(
        new PublicKey(STREAMFLOW_PROGRAM_ID),
        cancelStreamAccounts
      )
      const governance = assetAccounts.find(
        (account) => account.pubkey.toBase58() === creator_governance.toBase58()
      )?.governance
      serializedInstruction = serializeInstructionToBase64(instruction)
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid: true,
        governance,
      }
      const instructionData = new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
      try {
        const proposalAddress = await handleCreateProposal({
          title: defaultCancelTitle,
          description: '',
          voteByCouncil,
          instructionsData: [instructionData],
          governance: governance!,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
      setCreatingProposal(false)
    }
  }

  return (
    <>
      {}
      <div>
        <Button onClick={handleCancel} disabled={creatingProposal}>
          Cancel
        </Button>
      </div>
    </>
  )
}
