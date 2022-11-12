import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { cancelStreamInstruction } from '@streamflow/stream'
import GovernedAccountSelect from '@components/inputs/GovernedAccountSelect'
import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { isFormValid } from '@utils/formValidation'
import {
  CancelStreamForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'

const STREAMFLOW_PROGRAM_ID = 'strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m'

const STREAMFLOW_TREASURY_PUBLIC_KEY = new PublicKey(
  '5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw'
)

async function ata(mint: PublicKey, account: PublicKey) {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    account,
    true
  )
}

const CancelStream = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const strmProgram = new PublicKey(STREAMFLOW_PROGRAM_ID)

  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = strmProgram

  const [form, setForm] = useState<CancelStreamForm>({
    strmMetadata: '',
    recipient: '',
  })

  const schema = yup.object().shape({
    tokenAccount: yup.object().nullable().required('Token account is required'),
    recipient: yup.string().required('Recipient address is required'),
    strMetadata: yup.string().required('Stream Metadata address is required'),
  })

  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !wallet?.publicKey ||
      !form.tokenAccount?.governance?.account ||
      !form.tokenAccount ||
      !form.tokenAccount?.extensions.token
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.tokenAccount?.governance,
      }
    }
    const senderAccount = form.tokenAccount.extensions.token.account.owner
    const tokenAccount = form.tokenAccount.pubkey

    const strmMetadata = new PublicKey(form.strmMetadata)
    const tokenMint = form.tokenAccount.extensions.token?.account.mint
    const recipientPublicKey = new PublicKey(form.recipient)
    const recipientTokens = await ata(tokenMint, recipientPublicKey)
    const streamflowTreasuryTokens = await ata(
      tokenMint,
      STREAMFLOW_TREASURY_PUBLIC_KEY
    )
    const partnerPublicKey = senderAccount
    const partnerTokens = await ata(tokenMint, partnerPublicKey)
    const [escrowTokens] = await PublicKey.findProgramAddress(
      [Buffer.from('strm'), strmMetadata.toBuffer()],
      new PublicKey(STREAMFLOW_PROGRAM_ID)
    )

    const tx = cancelStreamInstruction(strmProgram, {
      authority: senderAccount,
      sender: senderAccount,
      senderTokens: tokenAccount,
      recipient: recipientPublicKey,
      recipientTokens,
      metadata: strmMetadata,
      escrowTokens,
      streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
      streamflowTreasuryTokens: streamflowTreasuryTokens,
      partner: partnerPublicKey,
      partnerTokens,
      mint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.tokenAccount.governance,
      shouldSplitIntoSeparateTxs: true,
    }
  }

  const setRecipient = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'recipient',
    })
  }
  const setStreamMetadata = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'strmMetadata',
    })
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.tokenAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  return (
    <>
      <GovernedAccountSelect
        label="Token account"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'tokenAccount' })
        }}
        value={form.tokenAccount}
        error={formErrors['tokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Recipient address"
        value={form.recipient}
        error={formErrors['recipient']}
        type="string"
        onChange={setRecipient}
      />
      <Input
        label="Stream Metadata address"
        value={form.strmMetadata}
        error={formErrors['strmMEtadata']}
        type="string"
        onChange={setStreamMetadata}
      />
    </>
  )
}

export default CancelStream
