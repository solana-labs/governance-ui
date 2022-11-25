import React, { useContext, useEffect, useState } from 'react'
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
  u64,
} from '@solana/spl-token'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { createUncheckedStreamInstruction } from '@streamflow/stream'
import Select from '@components/inputs/Select'
import { StyledLabel } from '@components/inputs/styles'
import { getMintMetadata } from '@components/instructions/programs/streamflow'
import Switch from '@components/Switch'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { isFormValid } from '@utils/formValidation'
import {
  CreateStreamForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useTreasuryInfo from '@hooks/useTreasuryInfo'
import Input from 'components/inputs/Input'
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import BigNumber from 'bignumber.js'

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
  FORTNIGHT: 14 * 24 * 3600,
  MONTH: Math.floor(30.4167 * 24 * 3600), //30.4167 days
  YEAR: 365 * 24 * 3600, // 365 days
}

const releaseFrequencyUnits = {
  0: { idx: 0, display: 'second', value: PERIOD.SECOND },
  1: { idx: 1, display: 'minute', value: PERIOD.MINUTE },
  2: { idx: 2, display: 'hour', value: PERIOD.HOUR },
  3: { idx: 3, display: 'day', value: PERIOD.DAY },
  4: { idx: 4, display: 'week', value: PERIOD.WEEK },
  5: { idx: 5, display: 'fortnight', value: PERIOD.FORTNIGHT },
  6: { idx: 6, display: 'month', value: PERIOD.MONTH },
  7: { idx: 7, display: 'year', value: PERIOD.YEAR },
}

function ata(mint: PublicKey, account: PublicKey): Promise<PublicKey> {
  return Token.getAssociatedTokenAddress(
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
  const treasuryInfo = useTreasuryInfo()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = strmProgram
  const [releaseUnitIdx, setReleaseUnitIdx] = useState<number>(0)
  const [startOnApproval, setStartOnApproval] = useState<boolean>(true)
  const [form, setForm] = useState<CreateStreamForm>({
    recipient: '',
    start: new Date().toISOString(),
    depositedAmount: 0,
    releaseAmount: 0,
    amountAtCliff: 0,
    cancelable: true,
    period: 1,
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
    let start
    if (!startOnApproval) {
      start = new u64(Math.floor(Date.parse(form.start) / 1000))
    } else [(start = new u64(0))]
    const strmMetadata = Keypair.generate()

    // Identifying Fee Payer account to support PDA owned tokens vesting
    const payerAccountStr:
      | string
      | undefined = (treasuryInfo as any).data.wallets.find(
      (wallet) =>
        wallet.governanceAddress ===
        form.tokenAccount?.extensions?.token?.account.owner.toBase58()
    )?.address
    const payerAccount = payerAccountStr
      ? new PublicKey(payerAccountStr)
      : senderAccount

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

    const createStreamData = {
      start,
      depositedAmount: new u64(
        new BigNumber(form.depositedAmount).shiftedBy(decimals).toString()
      ),
      period: new u64(form.period),
      cliff: start,
      cliffAmount: new u64(
        new BigNumber(form.amountAtCliff).shiftedBy(decimals).toString()
      ),
      amountPerPeriod: new u64(
        new BigNumber(form.releaseAmount).shiftedBy(decimals).toString()
      ),
      name: 'SPL Realms proposal',
      canTopup: false,
      cancelableBySender: form.cancelable,
      cancelableByRecipient: false,
      transferableBySender: true,
      transferableByRecipient: false,
      automaticWithdrawal: true,
      withdrawFrequency: new u64(form.period),
      recipient: recipientPublicKey,
      recipientTokens,
      streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
      streamflowTreasuryTokens,
      partner: partnerPublicKey,
      partnerTokens,
    }
    const createStreamAccounts = {
      payer: payerAccount,
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
      prerequisiteInstructionsSigners: signers,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    tokenAccount: yup.object().nullable().required('Token account is required'),
    recipient: yup.string().required('Recipient address is required'),
    start: yup.date().nullable().required('Start time is required'),
    depositedAmount: yup
      .number()
      .nullable()
      .min(0, 'Amount must be positive number')
      .required('Amount is required'),
    amountAtCliff: yup
      .number()
      .nullable()
      .min(0, 'Amount released at start must be positive number')
      .lessThan(
        yup.ref('depositedAmount'),
        'Amount released at start must be less than total amount'
      ),
    releaseAmount: yup
      .number()
      .nullable()
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
      <StyledLabel>Start stream on approval?</StyledLabel>
      <Switch checked={startOnApproval} onChange={setStartOnApproval}></Switch>
      {!startOnApproval && (
        <Input
          label="Start date"
          value={form.start}
          error={formErrors['start']}
          type="datetime-local"
          onChange={setStart}
        />
      )}
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
            label="Total amount"
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
        label="Amount per release"
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
          <Select
            label={'Release unit'}
            onChange={(unitIdx) => {
              setReleaseUnitIdx(releaseFrequencyUnits[unitIdx].idx)
              handleSetForm({
                value: releaseFrequencyUnits[unitIdx].value,
                propertyName: 'period',
              })
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
      <StyledLabel>Can contract be cancelled?</StyledLabel>
      <Switch checked={form.cancelable} onChange={setCancelable}></Switch>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Vesting contracts have Automatic Withdrawal enabled which is funded by
        contract creator. That adds additional transaction fees on creation
        (5000 lamports per release cycle). Additionally, Streamflow by default
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
