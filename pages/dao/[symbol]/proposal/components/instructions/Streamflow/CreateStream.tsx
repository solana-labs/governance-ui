import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import * as yup from 'yup'
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Keypair,
  TransactionInstruction,
} from '@solana/web3.js'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'
import { isFormValid } from '@utils/formValidation'
import {
  CreateStreamForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { getMintMetadata } from '@components/instructions/programs/streamflow'
import { createUncheckedStreamInstruction } from '@streamflow/stream'

const STREAMFLOW_TREASURY_PUBLIC_KEY = new PublicKey(
  '5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw'
)

const WITHDRAWOR_PUBLIC_KEY = new PublicKey(
  'wdrwhnCv4pzW8beKsbPa4S2UDZrXenjg16KJdKSpb5u'
)

const STREAMFLOW_PROGRAM_ID = 'DcAwL38mreGvUyykD2iitqcgu9hpFbtzxfaGpLi72kfY'

async function ata(mint: PublicKey, account: PublicKey) {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    account
  )
}

const CreateStream = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const strmProgram = new PublicKey(STREAMFLOW_PROGRAM_ID)

  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = strmProgram
  const [form, setForm] = useState<CreateStreamForm>({
    recipient: '',
    start: '',
    depositedAmount: 0,
    releaseFrequency: 60,
    releaseAmount: 0,
    amountAtCliff: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setRecipient = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'recipient',
    })
  }

  const setStart = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'start',
    })
  }

  const setDepositedAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'depositedAmount',
    })
  }

  const setReleaseFrequency = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'releaseFrequency',
    })
  }

  const setReleaseAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'releaseAmount',
    })
  }

  const setAmountAtCliff = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amountAtCliff',
    })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !form.tokenAccount ||
      !form.tokenAccount?.extensions.token ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const token = getMintMetadata(
      form.tokenAccount.extensions.token?.account.mint
    )
    const decimals = token?.decimals ? token.decimals : 0
    const tokenMint = form.tokenAccount.extensions.token?.account.mint
    const partnerPublicKey = STREAMFLOW_TREASURY_PUBLIC_KEY

    const partnerTokens = await ata(tokenMint, partnerPublicKey)
    const start = Math.floor(Date.parse(form.start) / 1000)
    const strmMetadata = Keypair.generate()

    const [escrowTokens] = await PublicKey.findProgramAddress(
      [Buffer.from('strm'), strmMetadata.publicKey.toBuffer()],
      new PublicKey(STREAMFLOW_PROGRAM_ID)
    )
    const streamflowTreasuryTokens = await ata(
      tokenMint,
      STREAMFLOW_TREASURY_PUBLIC_KEY
    )
    const recipientPublicKey = new PublicKey(form.recipient)
    const recipientTokens = await ata(tokenMint, recipientPublicKey)
    const prerequisiteInstructions: TransactionInstruction[] = [
      SystemProgram.createAccount({
        programId: new PublicKey(STREAMFLOW_PROGRAM_ID),
        space: 1104,
        lamports: 99388800,
        fromPubkey: wallet?.publicKey,
        newAccountPubkey: strmMetadata.publicKey,
      }),
    ]

    const tokenAccount = form.tokenAccount.pubkey

    const createStreamData = {
      start: new u64(start),
      depositedAmount: new u64(form.depositedAmount * 10 ** decimals),
      period: new u64(form.releaseFrequency),
      cliff: new u64(start),
      cliffAmount: new u64(form.amountAtCliff * 10 ** decimals),
      amountPerPeriod: new u64(form.releaseAmount * 10 ** decimals),
      name: 'SPL Realms proposal',
      canTopup: false,
      cancelableBySender: true,
      cancelableByRecipient: false,
      transferableBySender: true,
      transferableByRecipient: false,
      automaticWithdrawal: false,
      withdrawFrequency: new u64(form.releaseFrequency),
      recipient: recipientPublicKey,
      recipientTokens: recipientTokens,
      streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
      streamflowTreasuryTokens: streamflowTreasuryTokens,
      partner: partnerPublicKey,
      partnerTokens: partnerTokens,
    }
    const createStreamAccounts = {
      sender: form.governedAccount.pubkey,
      senderTokens: tokenAccount,
      metadata: strmMetadata.publicKey,
      escrowTokens,
      mint: tokenMint,
      feeOracle: STREAMFLOW_TREASURY_PUBLIC_KEY,
      rent: SYSVAR_RENT_PUBKEY,
      timelockProgram: new PublicKey(STREAMFLOW_PROGRAM_ID),
      tokenProgram: TOKEN_PROGRAM_ID,
      withdrawor: WITHDRAWOR_PUBLIC_KEY,
      systemProgram: SystemProgram.programId,
    }

    const tx = createUncheckedStreamInstruction(
      createStreamData,
      strmProgram,
      createStreamAccounts
    )
    const signers: Keypair[] = [strmMetadata]
    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      shouldSplitIntoSeparateTxs: true,
      signers,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Payer governance"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Recipient"
        value={form.recipient}
        type="string"
        onChange={setRecipient}
      />
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
        label="Start"
        value={form.start}
        type="datetime-local"
        onChange={setStart}
      />
      <Input
        label="Amount"
        value={form.depositedAmount}
        type="number"
        onChange={setDepositedAmount}
      />
      <Input
        label="Release frequency"
        value={form.releaseFrequency}
        type="number"
        onChange={setReleaseFrequency}
      />
      <Input
        label="Release amount"
        value={form.releaseAmount}
        type="number"
        onChange={setReleaseAmount}
      />
      <Input
        label="Cliff amount"
        value={form.amountAtCliff}
        type="number"
        onChange={setAmountAtCliff}
      />
    </>
  )
}

export default CreateStream
