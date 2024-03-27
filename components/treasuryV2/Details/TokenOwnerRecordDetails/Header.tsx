import cx from 'classnames'
import { UserGroupIcon } from '@heroicons/react/solid'
import { fmtMintAmount } from '@tools/sdk/units'
import { BN } from '@coral-xyz/anchor'
import Button from '@components/Button'
import { useState } from 'react'
import { notify } from '@utils/notifications'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
  withWithdrawGoverningTokens,
} from '@solana/spl-governance'
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
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { fetchRealmByPubkey, useRealmByPubkeyQuery } from '@hooks/queries/realm'
import mainnetBetaRealms from 'public/realms/mainnet-beta.json'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { fetchGovernanceByPubkey } from '@hooks/queries/governance'
import { fetchProgramVersion } from '@hooks/queries/useProgramVersionQuery'

interface Props {
  tokenOwnerRecord: PublicKey
  governance: PublicKey
}
export default function Header({ tokenOwnerRecord, governance }: Props) {
  const router = useRouter()
  const { cluster } = router.query
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  const tokenOwnerRecordData = useTokenOwnerRecordByPubkeyQuery(
    tokenOwnerRecord
  ).data?.result
  const realmPk = tokenOwnerRecordData?.account.realm
  const realm = useRealmByPubkeyQuery(realmPk).data?.result

  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()

  const [isLeaving, setIsLeaving] = useState(false)

  const { handleCreateProposal } = useCreateProposal()

  const handleLeave = async () => {
    if (!wallet || !wallet.publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet to vote.' })
      return
    }
    if (tokenOwnerRecordData === undefined) throw new Error()

    const realm = (
      await fetchRealmByPubkey(
        connection.current,
        tokenOwnerRecordData.account.realm
      )
    ).result
    if (realm === undefined) throw new Error()

    try {
      setIsLeaving(true)

      const instructions: TransactionInstruction[] = []

      const programVersion = await fetchProgramVersion(
        connection.current,
        new PublicKey(tokenOwnerRecordData.owner)
      )

      const ata = await getAssociatedTokenAddress(
        tokenOwnerRecordData.account.governingTokenMint,
        tokenOwnerRecordData.account.governingTokenOwner,
        true
      )

      try {
        await connection.current.getTokenAccountBalance(ata)
      } catch (e) {
        const [ix] = await createAssociatedTokenAccount(
          wallet.publicKey,
          tokenOwnerRecordData.account.governingTokenOwner,
          tokenOwnerRecordData.account.governingTokenMint
        )
        instructions.push(ix)
      }

      await withWithdrawGoverningTokens(
        instructions,
        new PublicKey(tokenOwnerRecordData.owner),
        programVersion,
        tokenOwnerRecordData.account.realm,
        ata,
        tokenOwnerRecordData.account.governingTokenMint,
        tokenOwnerRecordData.account.governingTokenOwner
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

      const governanceData = await (
        await fetchGovernanceByPubkey(connection.current, governance)
      ).result
      if (governanceData === undefined) throw new Error()

      instructions.forEach(async (ix) => {
        const serializedIx = serializeInstructionToBase64(ix)

        const ixData = {
          data: getInstructionDataFromBase64(serializedIx),
          holdUpTime: governanceData.account.config.minInstructionHoldUpTime,
          prerequisiteInstructions: [],
        }

        instructionsData.push(ixData)
      })

      const governingMintInfo = await tryGetMint(
        connection.current,
        tokenOwnerRecordData.account.governingTokenMint
      )
      if (!governingMintInfo) {
        notify({ type: 'error', message: 'Could not find governing mint info' })
        return
      }

      const proposalAddress = await handleCreateProposal({
        title: `Leave ${realm.account.name}`,
        description: `Withdrawing ${fmtMintAmount(
          governingMintInfo.account,
          tokenOwnerRecordData.account.governingTokenDepositAmount
        )} governing tokens from ${realm.account.name}`,
        instructionsData,
        governance: { pubkey: governance },
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

  const realmInfo = mainnetBetaRealms.find(
    (x) => x.realmId === tokenOwnerRecordData?.account.realm.toString()
  )

  const mint = useMintInfoByPubkeyQuery(
    tokenOwnerRecordData?.account.governingTokenMint
  ).data?.result

  return (
    <div
      className={cx(
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
          {realmInfo?.ogImage ? (
            <img
              src={realmInfo?.ogImage}
              alt={realmInfo?.symbol}
              className="h-12 w-auto"
            />
          ) : (
            <UserGroupIcon className="h-12 w-12 fill-fgd-1" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-fgd-3">
            {tokenOwnerRecord.toBase58().slice(0, 10)}...
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-fgd-1">
              {realmInfo?.displayName ?? realm?.account.name ?? '...'}
            </p>
            <Link
              href={`/dao/${realmInfo?.symbol ?? realmPk}${
                cluster ? `?cluster=${cluster}` : ''
              }`}
            >
              <a target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 text-slate-500 cursor-pointer" />
              </a>
            </Link>
          </div>
          <p className="text-fgd-3">
            Community Votes: {/** todo check for council */}
            {fmtMintAmount(
              mint,
              new BN(
                tokenOwnerRecordData?.account.governingTokenDepositAmount.toString() ??
                  0
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
