import cx from 'classnames'
import { TokenOwnerRecordAsset } from '@models/treasury/Asset'
import { UserGroupIcon } from '@heroicons/react/solid'
import { fmtMintAmount } from '@tools/sdk/units'
import { BN } from '@coral-xyz/anchor'
import Button from '@components/Button'
import { useState } from 'react'
import { notify } from '@utils/notifications'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
  withWithdrawGoverningTokens,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { createAssociatedTokenAccount } from '@utils/associated'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { tryGetMint } from '@utils/tokens'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import Link from 'next/link'

interface Props {
  className?: string
  tokenOwnerRecordAsset: TokenOwnerRecordAsset
}
export default function Header(props: Props) {
  const router = useRouter()
  const { cluster } = router.query
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  const asset = props.tokenOwnerRecordAsset

  const connection = useWalletStore((s) => s.connection)
  const { current: wallet } = useWalletStore()

  const [isLeaving, setIsLeaving] = useState(false)

  const { handleCreateProposal } = useCreateProposal()

  const handleLeave = async () => {
    if (!wallet || !wallet.publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet to vote.' })
      return
    }

    try {
      setIsLeaving(true)

      const instructions: TransactionInstruction[] = []

      const programVersion = await getGovernanceProgramVersion(
        connection.current,
        new PublicKey(asset.programId)
      )

      const ata = await getAssociatedTokenAddress(
        asset.tokenOwnerRecordAccount.account.governingTokenMint,
        asset.tokenOwnerRecordAccount.account.governingTokenOwner,
        true
      )

      try {
        await connection.current.getTokenAccountBalance(ata)
      } catch (e) {
        const [ix] = await createAssociatedTokenAccount(
          wallet.publicKey,
          asset.tokenOwnerRecordAccount.account.governingTokenOwner,
          asset.tokenOwnerRecordAccount.account.governingTokenMint
        )
        instructions.push(ix)
      }

      await withWithdrawGoverningTokens(
        instructions,
        new PublicKey(asset.programId),
        programVersion,
        asset.realmAccount.pubkey,
        ata,
        asset.tokenOwnerRecordAccount.account.governingTokenMint,
        asset.tokenOwnerRecordAccount.account.governingTokenOwner
      )

      const tx = new Transaction({ feePayer: wallet.publicKey }).add(
        ...instructions
      )
      const simulated = await connection.current.simulateTransaction(tx)

      if (simulated.value.err) {
        console.log('[SPL_GOV] simulated logs ', simulated.value.logs)
        notify({
          type: 'error',
          message: 'Transaction simulation failed. Check console for logs.',
        })
        return
      }

      const instructionsData: InstructionDataWithHoldUpTime[] = []

      instructions.forEach(async (ix) => {
        const serializedIx = serializeInstructionToBase64(ix)

        const ixData = {
          data: getInstructionDataFromBase64(serializedIx),
          holdUpTime:
            asset.governanceOwner.account.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
          shouldSplitIntoSeparateTxs: false,
        }

        instructionsData.push(ixData)
      })

      const governingMintInfo = await tryGetMint(
        connection.current,
        asset.tokenOwnerRecordAccount.account.governingTokenMint
      )
      if (!governingMintInfo) {
        notify({ type: 'error', message: 'Could not find governing mint info' })
        return
      }

      const proposalAddress = await handleCreateProposal({
        title: `Leave ${asset.realmAccount.account.name}`,
        description: `Withdrawing ${fmtMintAmount(
          governingMintInfo.account,
          asset.tokenOwnerRecordAccount.account.governingTokenDepositAmount
        )} governing tokens from ${
          props.tokenOwnerRecordAsset.realmAccount.account.name
        }`,
        instructionsData,
        governance: props.tokenOwnerRecordAsset.governanceOwner,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      await router.push(url)
    } catch (e) {
      console.error("[SPL_GOV] Can't leave realm", e)
      notify({ type: 'error', message: 'Failed to leave DAO.' })
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div className="flex space-x-3 items-center">
        <div>
          {asset.realmImage ? (
            <img
              src={asset.realmImage}
              alt={asset.realmSymbol}
              className="h-12 w-auto"
            />
          ) : (
            <UserGroupIcon className="h-12 w-12 fill-fgd-1" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-fgd-3">
            {asset.address.toBase58().slice(0, 10)}...
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-fgd-1">{asset.displayName}</p>
            <Link
              href={`/dao/${asset.realmSymbol}${
                cluster ? `?cluster=${cluster}` : ''
              }`}
            >
              <a target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 text-slate-500 cursor-pointer" />
              </a>
            </Link>
          </div>
          <p className="text-fgd-3">
            Community Votes:{' '}
            {fmtMintAmount(
              asset.communityMint.account,
              new BN(
                asset.tokenOwnerRecordAccount.account.governingTokenDepositAmount.toString()
              )
            )}
          </p>
        </div>
      </div>
      <div>
        <Button
          onClick={handleLeave}
          disabled={isLeaving || !wallet || !wallet.publicKey}
        >
          Leave DAO
        </Button>
      </div>
    </div>
  )
}
