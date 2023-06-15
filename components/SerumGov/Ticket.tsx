import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { getExplorerUrl } from '@components/explorer/tools'
import Loading from '@components/Loading'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import useCreateProposal from '@hooks/useCreateProposal'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { fmtBnMintDecimals } from '@tools/sdk/units'
import { createAssociatedTokenAccount } from '@utils/associated'
import { fmtSecsToTime, fmtTimeToString } from '@utils/formatting'
import { notify } from '@utils/notifications'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import useSerumGovStore, {
  ClaimTicketType,
  MSRM_DECIMALS,
  RedeemTicketType,
  SRM_DECIMALS,
} from 'stores/useSerumGovStore'

type TicketType = ClaimTicketType | RedeemTicketType

function isClaimTicket(
  toBeDetermined: TicketType
): toBeDetermined is ClaimTicketType {
  if ((toBeDetermined as ClaimTicketType).claimDelay) {
    return true
  }
  return false
}

type Props = {
  ticket: TicketType
  callback?: () => Promise<void>
  createProposal?: {
    governance?: ProgramAccount<Governance>
    owner: PublicKey
  }
}
const Ticket: FC<Props> = ({ ticket, createProposal, callback }) => {
  const router = useRouter()
  const { cluster } = router.query

  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  const { connection } = useConnection()
  const { anchorProvider, wallet } = useWalletDeprecated()

  const actions = useSerumGovStore((s) => s.actions)
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)

  const [isClaiming, setIsClaiming] = useState(false)

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null) // NOTE: set to high number to disable initially

  const { handleCreateProposal } = useCreateProposal()

  useEffect(() => {
    const timeRemainingInterval = setInterval(() => {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const endTimestamp =
        ticket.createdAt +
        (isClaimTicket(ticket) ? ticket.claimDelay : ticket.redeemDelay)

      setTimeRemaining(endTimestamp - currentTimestamp)
    }, 1000)

    return () => clearInterval(timeRemainingInterval)
  }, [ticket])

  const handleButton = async (ticket: TicketType) => {
    if (wallet && wallet.publicKey) {
      setIsClaiming(true)
      // If claim ticket
      if (isClaimTicket(ticket)) {
        if (!createProposal) {
          // If sendTransaction (for user wallets)
          await actions.claim(connection, anchorProvider, ticket, wallet)
          if (callback) await callback()
        } else {
          // else create proposal (for DAO wallets);
          try {
            const instructions: TransactionInstruction[] = []
            const { owner } = createProposal
            const ownerAta = await getAssociatedTokenAddress(
              gsrmMint,
              owner,
              true
            )
            // Adding createATA if not already exists
            try {
              await connection.getTokenAccountBalance(ownerAta, 'confirmed')
            } catch (e) {
              const [ix] = await createAssociatedTokenAccount(
                owner,
                owner,
                gsrmMint
              )
              instructions.push(ix)
            }
            const ix = await actions.getClaimInstruction(
              anchorProvider,
              ticket,
              createProposal.owner
            )
            instructions.push(ix)

            const instructionsData: InstructionDataWithHoldUpTime[] = []

            instructions.forEach(async (ix) => {
              const serializedIx = serializeInstructionToBase64(ix)

              const ixData = {
                data: getInstructionDataFromBase64(serializedIx),
                holdUpTime:
                  createProposal.governance?.account.config
                    .minInstructionHoldUpTime,
                prerequisiteInstructions: [],
              }

              instructionsData.push(ixData)
            })

            const tx = new Transaction({ feePayer: owner }).add(
              ...instructions.map((i) => i)
            )
            const simulationResult = await connection.simulateTransaction(tx)

            if (simulationResult.value.err) {
              notify({
                type: 'error',
                message: 'Transaction simulation failed.',
              })
              // setIsBurning(false)
              return
            }
            const proposalAddress = await handleCreateProposal({
              title: `Serum DAO: Claim ${fmtBnMintDecimals(
                ticket.gsrmAmount,
                SRM_DECIMALS
              )} gSRM`,
              description: `Claiming ticketId: ${ticket.address.toBase58()}`,
              instructionsData,
              governance: createProposal.governance!,
            })
            const url = fmtUrlWithCluster(
              `/dao/${symbol}/proposal/${proposalAddress}`
            )
            await router.push(url)
          } catch (ex) {
            console.error('Failed to add Claim Proposal', ex)
            notify({
              type: 'error',
              message: `Something went wrong. Please check console.`,
            })
          }
        }
      } else {
        if (!createProposal) {
          await actions.redeem(connection, anchorProvider, ticket, wallet)
          if (callback) await callback()
        } else {
          try {
            const instructions: TransactionInstruction[] = []
            const { owner } = createProposal
            const ownerAta = await getAssociatedTokenAddress(
              gsrmMint,
              owner,
              true
            )
            // Adding createATA if not already exists
            try {
              await connection.getTokenAccountBalance(ownerAta, 'confirmed')
            } catch (e) {
              const [ix] = await createAssociatedTokenAccount(
                owner,
                owner,
                gsrmMint
              )
              instructions.push(ix)
            }

            const ix = await actions.getRedeemInstruction(
              anchorProvider,
              ticket,
              createProposal.owner
            )
            instructions.push(ix)

            const instructionsData: InstructionDataWithHoldUpTime[] = []

            instructions.forEach(async (ix) => {
              const serializedIx = serializeInstructionToBase64(ix)

              const ixData = {
                data: getInstructionDataFromBase64(serializedIx),
                holdUpTime:
                  createProposal.governance?.account.config
                    .minInstructionHoldUpTime,
                prerequisiteInstructions: [],
              }

              instructionsData.push(ixData)
            })

            const tx = new Transaction().add(...instructions.map((i) => i))
            const simulationResult = await connection.simulateTransaction(tx)

            if (simulationResult.value.err) {
              notify({
                type: 'error',
                message: 'Transaction simulation failed.',
              })
              // setIsBurning(false)
              return
            }

            const proposalAddress = await handleCreateProposal({
              title: `Serum DAO: Redeem ${new BigNumber(
                ticket.amount.toString()
              )
                .shiftedBy(-1 * (ticket.isMsrm ? MSRM_DECIMALS : SRM_DECIMALS))
                .toFormat()} ${ticket.isMsrm ? 'MSRM' : 'SRM'}`,
              description: `Redeeming ticketId: ${ticket.address.toBase58()}`,
              instructionsData,
              governance: createProposal.governance!,
            })
            const url = fmtUrlWithCluster(
              `/dao/${symbol}/proposal/${proposalAddress}`
            )
            await router.push(url)
          } catch (ex) {
            console.error('Failed to add Claim Proposal', ex)
            notify({
              type: 'error',
              message: `Something went wrong. Please check console.`,
            })
          }
        }
      }
      setIsClaiming(false)
    } else {
      notify({ type: 'error', message: 'Wallet not connected.' })
    }
  }

  return (
    <div
      className={classNames(
        'p-3 text-xs rounded-md',
        createProposal ? 'bg-bkg-2' : 'bg-bkg-3'
      )}
    >
      <div className="flex items-center space-x-1 mb-1">
        <p className="text-xs text-fgd-3">
          {isClaimTicket(ticket) ? 'Claim Ticket' : 'Redeem Ticket'}
        </p>
        <Link href={getExplorerUrl(cluster as string, ticket.address)} passHref>
          <a target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="h-4 w-4 text-slate-500" />
          </a>
        </Link>
      </div>
      <div className="w-full flex items-center justify-between">
        {gsrmMint && (
          <p className="text-fgd-1 text-xl font-semibold">
            {isClaimTicket(ticket)
              ? `${fmtBnMintDecimals(ticket.gsrmAmount, SRM_DECIMALS)}`
              : `${new BigNumber(ticket.amount.toString())
                  .shiftedBy(
                    -1 * (ticket.isMsrm ? MSRM_DECIMALS : SRM_DECIMALS)
                  )
                  .toFormat()}`}{' '}
            {isClaimTicket(ticket) ? 'gSRM' : ticket.isMsrm ? 'MSRM' : 'SRM'}
          </p>
        )}
        {timeRemaining !== null && (
          <button
            className={`py-2 px-4 rounded-md bg-green text-fgd-4 disabled:bg-fgd-4 disabled:text-gray-500`}
            onClick={async () => await handleButton(ticket)}
            disabled={timeRemaining > 0 || isClaiming || !wallet?.publicKey}
          >
            {timeRemaining > 0 ? (
              fmtTimeToString(fmtSecsToTime(timeRemaining))
            ) : !isClaiming ? (
              isClaimTicket(ticket) ? (
                'Claim'
              ) : (
                'Unlock'
              )
            ) : (
              <Loading />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default Ticket
