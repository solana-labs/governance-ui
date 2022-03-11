import {
  MangoAccount,
  ReferrerIdRecord,
  makeRegisterReferrerIdInstruction,
  MangoGroup,
  INFO_LEN,
} from '@blockworks-foundation/mango-client'
import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Tooltip from '@components/Tooltip'
import { DuplicateIcon } from '@heroicons/react/outline'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey, Transaction } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { sendTransaction } from '@utils/send'
import { useState, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { tryGetMangoAccount } from 'Strategies/protocols/mango/tools'
import { MarketStore } from 'Strategies/store/marketStore'
const minMngoToCreateLink = 10000
const CreateRefForm = ({
  selectedMangoAccount,
  market,
  mint,
}: {
  selectedMangoAccount: MangoAccount
  market: MarketStore
  mint: PublicKey
}) => {
  const connection = useWalletStore((s) => s.connection)

  const link =
    connection.cluster === 'devnet'
      ? `http://devnet.mango.markets/?ref=`
      : `https://trade.mango.markets/?ref`
  const depositIndex = market.group!.tokens.findIndex(
    (x) => x.mint.toBase58() === mint.toBase58()
  )
  const { canUseTransferInstruction } = useGovernanceAssets()

  const wallet = useWalletStore((s) => s.current)
  const currentPosition = selectedMangoAccount
    .getUiDeposit(
      market.cache!.rootBankCache[depositIndex],
      market.group!,
      depositIndex
    )
    .toNumber()
  const [existingLinks, setExistingLinks] = useState<ReferrerIdRecord[]>([])
  const [linkGenerated, setLinkGenerated] = useState(false)
  const [linkName, setLinkName] = useState('')
  const connected = useWalletStore((s) => s.connected)
  const handleCreateLink = async () => {
    setLinkGenerated(false)
    try {
      const signers = []
      const programId = market.client!.programId
      const mangoGroup = market.group
      const { referrerPda, encodedReferrerId } = await getReferrerPda(
        mangoGroup!,
        linkName,
        programId
      )
      const instruction = makeRegisterReferrerIdInstruction(
        programId,
        mangoGroup!.publicKey,
        selectedMangoAccount!.publicKey,
        referrerPda,
        wallet!.publicKey!,
        encodedReferrerId
      )

      const transaction = new Transaction()
      transaction.add(instruction)
      await sendTransaction({
        transaction,
        wallet,
        connection: connection.current,
        signers,
        sendingMessage: 'Creating ref link',
        successMessage: 'Ref link created',
      })
      setLinkGenerated(true)
    } catch (e) {
      setLinkGenerated(false)
      notify({ type: 'error', message: "Can't generate link" })
    }
  }
  const getReferrerPda = async (
    mangoGroup: MangoGroup,
    referrerId: string,
    programId: PublicKey
  ): Promise<{ referrerPda: PublicKey; encodedReferrerId: Buffer }> => {
    const encoded = Buffer.from(referrerId, 'utf8')
    if (encoded.length > INFO_LEN) {
      throw new Error(
        `info string too long. Must be less than or equal to ${INFO_LEN} bytes`
      )
    }

    const encodedReferrerId = Buffer.concat([
      encoded,
      Buffer.alloc(INFO_LEN - encoded.length, 0),
    ])

    // Generate the PDA pubkey
    const [referrerIdRecordPk] = await PublicKey.findProgramAddress(
      [
        mangoGroup.publicKey.toBytes(),
        new Buffer('ReferrerIdRecord', 'utf-8'),
        encodedReferrerId,
      ],
      programId
    )

    return { referrerPda: referrerIdRecordPk, encodedReferrerId }
  }
  useEffect(() => {
    const getRefLinks = async () => {
      const client = market.client
      const mangoAccountPk = selectedMangoAccount!.publicKey
      const account = await tryGetMangoAccount(market, mangoAccountPk)
      if (account) {
        const referrerIds = await client?.getReferrerIdsForMangoAccount(account)
        if (referrerIds) {
          setExistingLinks(referrerIds)
        }
      }
    }
    if (selectedMangoAccount) {
      getRefLinks()
    } else {
      setExistingLinks([])
    }
    setLinkName('')
  }, [selectedMangoAccount])
  return (
    <div>
      <Input
        label="Referral ID"
        value={linkName}
        type="text"
        onChange={(e) => setLinkName(e.target.value)}
      />
      <Button
        className="w-full mt-6"
        onClick={handleCreateLink}
        disabled={
          currentPosition < minMngoToCreateLink ||
          !connected ||
          !linkName.length ||
          !canUseTransferInstruction
        }
      >
        <Tooltip
          content={
            !canUseTransferInstruction
              ? 'Please connect wallet with enough voting power to create treasury proposals'
              : currentPosition < minMngoToCreateLink
              ? 'Please deposit at least 10000 MNGO to create link'
              : !linkName.length
              ? 'Please type link name'
              : ''
          }
        >
          Create Referral Link
        </Tooltip>
      </Button>
      {linkGenerated || existingLinks.length > 0 ? (
        <div className="pt-6">
          {linkGenerated && (
            <div className="border border-fgd-4 px-4 py-2 rounded-md w-full break-all flex items-center">
              <div>
                <div className="text-xs text-fgd-1">
                  {link}
                  {linkName}
                </div>
              </div>
              <div className="ml-auto">
                <LinkButton
                  className="ml-4 text-primary-light"
                  onClick={() => {
                    navigator.clipboard.writeText(`${link}${linkName}`)
                  }}
                >
                  <DuplicateIcon className="w-5 h-5 mt-1" />
                </LinkButton>
              </div>
            </div>
          )}
          {existingLinks.map((x) => (
            <div
              key={x.referrerId}
              className="border border-fgd-4 px-4 py-2 rounded-md w-full break-all flex items-center"
            >
              <div>
                <div className="text-xs text-fgd-1">
                  {link}
                  {x.referrerId}
                </div>
              </div>
              <div className="ml-auto">
                <LinkButton
                  className="ml-4 text-primary-light"
                  onClick={() => {
                    navigator.clipboard.writeText(`${link}${x.referrerId}`)
                  }}
                >
                  <DuplicateIcon className="w-5 h-5 mt-1" />
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default CreateRefForm
