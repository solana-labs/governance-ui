import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import Switch from '@components/Switch'

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
import Select from '@components/inputs/Select'
import { StyledLabel } from '@components/inputs/styles'
// import { ConnectionContext } from '@utils/connection'

const STREAMFLOW_TREASURY_PUBLIC_KEY = new PublicKey(
  '5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw'
)

const WITHDRAWOR_PUBLIC_KEY = new PublicKey(
  'wdrwhnCv4pzW8beKsbPa4S2UDZrXenjg16KJdKSpb5u'
)

export const STREAMFLOW_PROGRAM_ID =
  'strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m'

export const PERIOD = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 24 * 3600,
  WEEK: 7 * 24 * 3600,
  MONTH: Math.floor(30.4167 * 24 * 3600), //30.4167 days
  YEAR: 365 * 24 * 3600, // 365 days
}

const releaseFrequencyUnits = {
  0: { idx: 0, display: 'seconds', value: PERIOD.SECOND },
  1: { idx: 1, display: 'minutes', value: PERIOD.MINUTE },
  2: { idx: 2, display: 'hours', value: PERIOD.HOUR },
  3: { idx: 3, display: 'days', value: PERIOD.DAY },
  4: { idx: 4, display: 'weeks', value: PERIOD.WEEK },
  5: { idx: 5, display: 'months', value: PERIOD.MONTH },
  6: { idx: 6, display: 'years', value: PERIOD.YEAR },
}

async function ata(mint: PublicKey, account: PublicKey) {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    account,
    true
  )
}

async function checkInitTokenAccount(
  account: PublicKey,
  instructions: TransactionInstruction[],
  connection: any,
  mint: PublicKey,
  owner: PublicKey,
  feePayer: PublicKey
) {
  const accountInfo = await connection.current.getAccountInfo(account)
  if (accountInfo && accountInfo.lamports > 0) {
    return
  }
  instructions.push(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mint, // mint
      account, // ata
      owner, // owner of token account
      feePayer
    )
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
  const strmProgram = new PublicKey(STREAMFLOW_PROGRAM_ID)

  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = strmProgram
  const [releaseUnitIdx, setReleaseUnitIdx] = useState<number>(0)
  const [form, setForm] = useState<CreateStreamForm>({
    recipient: '',
    start: '',
    depositedAmount: 0,
    releaseFrequency: 60,
    releaseAmount: 0,
    amountAtCliff: 0,
    cancelable: false,
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

  const setCancelable = (value) => {
    handleSetForm({
      value,
      propertyName: 'cancelable',
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
      !form.tokenAccount?.governance?.account ||
      !form.tokenAccount ||
      !form.tokenAccount?.extensions.token ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.tokenAccount?.governance,
      }
    }
    const token = getMintMetadata(
      form.tokenAccount.extensions.token?.account.mint
    )
    const decimals = token?.decimals ? token.decimals : 0
    const tokenMint = form.tokenAccount.extensions.token?.account.mint
    const senderAccount = form.tokenAccount.extensions.token.account.owner
    const partnerPublicKey = senderAccount
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

    checkInitTokenAccount(
      recipientTokens,
      prerequisiteInstructions,
      connection,
      tokenMint,
      recipientPublicKey,
      wallet?.publicKey
    )
    checkInitTokenAccount(
      partnerTokens,
      prerequisiteInstructions,
      connection,
      tokenMint,
      partnerPublicKey,
      wallet?.publicKey
    )
    checkInitTokenAccount(
      streamflowTreasuryTokens,
      prerequisiteInstructions,
      connection,
      tokenMint,
      STREAMFLOW_TREASURY_PUBLIC_KEY,
      wallet?.publicKey
    )

    const tokenAccount = form.tokenAccount.pubkey
    const period =
      form.releaseFrequency * releaseFrequencyUnits[releaseUnitIdx].value
    const createStreamData = {
      start: new u64(start),
      depositedAmount: new u64(form.depositedAmount * 10 ** decimals),
      period: new u64(period),
      cliff: new u64(start),
      cliffAmount: new u64(form.amountAtCliff * 10 ** decimals),
      amountPerPeriod: new u64(form.releaseAmount * 10 ** decimals),
      name: 'SPL Realms proposal',
      canTopup: false,
      cancelableBySender: form.cancelable,
      cancelableByRecipient: false,
      transferableBySender: true,
      transferableByRecipient: false,
      automaticWithdrawal: true,
      withdrawFrequency: new u64(period),
      recipient: recipientPublicKey,
      recipientTokens: recipientTokens,
      streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
      streamflowTreasuryTokens: streamflowTreasuryTokens,
      partner: partnerPublicKey,
      partnerTokens: partnerTokens,
    }
    const createStreamAccounts = {
      sender: senderAccount,
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
      governance: form.tokenAccount.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      shouldSplitIntoSeparateTxs: true,
      signers,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.tokenAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    tokenAccount: yup.object().nullable().required('Token account is required'),
    recipient: yup.string().required('Recipient address is required'),
    start: yup.date().nullable().required('Start time is required'),
    depositedAmount: yup
      .number()
      .integer()
      .nullable()
      .min(0, 'Amount must be positive number')
      .required('Amount is required'),
    amountAtCliff: yup
      .number()
      .integer()
      .moreThan(0, 'Amount released at start must be positive number')
      .lessThan(
        yup.ref('depositedAmount'),
        'Amount released at start must be less than total amount'
      ),
    releaseAmount: yup
      .number()
      .integer()
      .moreThan(0, 'Release amount must be positive number')
      .lessThan(
        yup.ref('depositedAmount'),
        'Release amount must be less than total amount'
      ),
  })

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
        label="Start"
        value={form.start}
        error={formErrors['start']}
        type="datetime-local"
        onChange={setStart}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxWidth: '512px',
          alignItems: 'end',
        }}
      >
        <div style={{ width: '45%' }}>
          <Input
            label="Amount"
            value={form.depositedAmount}
            error={formErrors['amount']}
            type="number"
            onChange={setDepositedAmount}
          />
        </div>
        <div style={{ width: '45%' }}>
          <Input
            label="Released at start"
            value={form.amountAtCliff}
            error={formErrors['amountAtCliff']}
            type="number"
            onChange={setAmountAtCliff}
          />
        </div>
      </div>
      <Input
        label="Release amount"
        value={form.releaseAmount}
        error={formErrors['releaseAmount']}
        type="number"
        onChange={setReleaseAmount}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxWidth: '512px',
          alignItems: 'end',
        }}
      >
        <div style={{ width: '45%' }}>
          <Input
            label="Release frequency"
            value={form.releaseFrequency}
            error={formErrors['releaseFrequency']}
            type="number"
            onChange={setReleaseFrequency}
          />
        </div>
        <div style={{ width: '45%' }}>
          <Select
            label={'Release unit'}
            onChange={(unitIdx) => {
              setReleaseUnitIdx(unitIdx)
            }}
            placeholder="Please select..."
            value={releaseFrequencyUnits[releaseUnitIdx].display}
          >
            {Object.values(releaseFrequencyUnits).map((unit) => {
              return (
                <Select.Option key={unit.idx} value={unit.idx}>
                  {unit.display}
                </Select.Option>
              )
            })}
          </Select>
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      ></div>
      <StyledLabel>Is contract cancelable?</StyledLabel>
      <Switch checked={form.cancelable} onChange={setCancelable}></Switch>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Vesting contracts have Automatic Withdrawal enabled which is funded by
        contract creator. That adds additional transaction fees on creation:
        5000 lamports per release cycle. Additionally, Streamflow by default
        charges a service fee of 0.25% in tokens being vested.
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Please ensure that the SOL treasury account holds enough SOL to cover
        the transaction costs at the time of execution.
      </div>
    </>
  )
}

export default CreateStream
