import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import { sha256 } from 'js-sha256'

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
  AccountInfo as TokenAccount,
  AccountLayout,
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

export const STREAMFLOW_TREASURY_PUBLIC_KEY = new PublicKey(
  '5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw'
)

export const WITHDRAWOR_PUBLIC_KEY = new PublicKey(
  'wdrwhnCv4pzW8beKsbPa4S2UDZrXenjg16KJdKSpb5u'
)

const BufferLayout = require('buffer-layout')

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
  governance: ProgramAccount<Governance>
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()

  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateStreamForm>({
    recipient: '',
    tokenAccount: '',
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

  const setTokenAccount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'tokenAccount',
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
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const STREAMFLOW_PROGRAM_ID = '6h7XgGRiHae5C6p3cWo44Ga7jwxRN4KS8TtLabVVVGYS'
    const TOKEN_MINT = 'Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj'
    const partnerPublicKey = STREAMFLOW_TREASURY_PUBLIC_KEY

    const strmProgram = new PublicKey(STREAMFLOW_PROGRAM_ID)

    const partnerTokens = await ata(new PublicKey(TOKEN_MINT), partnerPublicKey)
    const strmMetadata = Keypair.generate()

    const [escrowTokens] = await PublicKey.findProgramAddress(
      [Buffer.from('strm'), strmMetadata.publicKey.toBuffer()],
      new PublicKey(STREAMFLOW_PROGRAM_ID)
    )
    const streamflowTreasuryTokens = await ata(
      new PublicKey(TOKEN_MINT),
      STREAMFLOW_TREASURY_PUBLIC_KEY
    )

    const recipientPublicKey = new PublicKey(form.recipient)
    const recipientTokens = await ata(
      new PublicKey(TOKEN_MINT),
      recipientPublicKey
    )

    const prerequisiteInstructions: TransactionInstruction[] = []

    const metadataAcc = SystemProgram.createAccount({
      programId: new PublicKey(STREAMFLOW_PROGRAM_ID),
      space: 1500,
      lamports: 99388800,
      fromPubkey: wallet?.publicKey,
      newAccountPubkey: strmMetadata.publicKey,
    })

    prerequisiteInstructions.push(metadataAcc)

    const tokenAccount = new PublicKey(form.tokenAccount)

    const createStreamData = {
      start: new u64(1677148534), // Timestamp (in seconds) when the stream/token vesting starts.
      depositedAmount: new u64(1000000000000), // Deposited amount of tokens (in the smallest units).
      period: new u64(1), // Time step (period) in seconds per which the unlocking occurs.
      cliff: new u64(1677148534), // Vesting contract "cliff" timestamp in seconds.
      cliffAmount: new u64(0), // Amount unlocked at the "cliff" timestamp.
      amountPerPeriod: new u64(5000000000), // Release rate: how many tokens are unlocked per each period.
      name: 'Test', // The stream name/subject.
      canTopup: false, // setting to FALSE will effectively create a vesting contract.
      cancelableBySender: true, // Whether or not sender can cancel the stream.
      cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
      transferableBySender: true, // Whether or not sender can transfer the stream.
      transferableByRecipient: false, // Whether or not recipient can transfer the stream.
      automaticWithdrawal: false, // Whether or not a 3rd party can initiate withdraw in the name of recipient (currently not used, set it to FALSE).
      withdrawFrequency: new u64(30),
      recipient: recipientPublicKey,
      recipientTokens: recipientTokens,
      streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
      streamflowTreasuryTokens: streamflowTreasuryTokens,
      partner: partnerPublicKey,
      partnerTokens: partnerTokens,
    }
    console.log("LOG")
    console.log(form.governedAccount.pubkey.toBase58())
    console.log('LOG')
    const createStreamAccounts = {
      sender: form.governedAccount.pubkey,
      senderTokens: tokenAccount,
      metadata: strmMetadata.publicKey,
      escrowTokens,
      mint: new PublicKey(TOKEN_MINT),
      feeOracle: STREAMFLOW_TREASURY_PUBLIC_KEY,
      rent: SYSVAR_RENT_PUBKEY,
      timelockProgram: new PublicKey(STREAMFLOW_PROGRAM_ID),
      tokenProgram: TOKEN_PROGRAM_ID,
      withdrawor: WITHDRAWOR_PUBLIC_KEY,
      systemProgram: SystemProgram.programId,
    }
    const keys = [
      { pubkey: createStreamAccounts.sender, isSigner: true, isWritable: true },
      {
        pubkey: createStreamAccounts.senderTokens,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: createStreamAccounts.metadata,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: createStreamAccounts.escrowTokens,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: createStreamAccounts.withdrawor,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: createStreamAccounts.mint, isSigner: false, isWritable: false },
      {
        pubkey: createStreamAccounts.feeOracle,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: createStreamAccounts.rent, isSigner: false, isWritable: false },
      {
        pubkey: createStreamAccounts.timelockProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: createStreamAccounts.tokenProgram,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: createStreamAccounts.systemProgram,
        isSigner: false,
        isWritable: false,
      },
    ]
    const createStreamLayout: typeof BufferLayout.Structure = BufferLayout.struct(
      [
        BufferLayout.blob(8, 'start_time'),
        BufferLayout.blob(8, 'net_amount_deposited'),
        BufferLayout.blob(8, 'period'),
        BufferLayout.blob(8, 'amount_per_period'),
        BufferLayout.blob(8, 'cliff'),
        BufferLayout.blob(8, 'cliff_amount'),
        BufferLayout.u8('cancelable_by_sender'),
        BufferLayout.u8('cancelable_by_recipient'),
        BufferLayout.u8('automatic_withdrawal'),
        BufferLayout.u8('transferable_by_sender'),
        BufferLayout.u8('transferable_by_recipient'),
        BufferLayout.u8('can_topup'),
        BufferLayout.blob(64, 'stream_name'),
        BufferLayout.blob(8, 'withdraw_frequency'),
        BufferLayout.blob(32, 'recipient'),
        BufferLayout.blob(32, 'partner'),
      ]
    )
    // todo adapt protocol handler to match this setup
    // add zeros to shorter stream name
    // derrive streamflow_treasury_tokens on protocol
    // set partner and partner tokens to streamflow by defualt on protocol
    // initialize metadata before proposal creation
    //
    let bufferData = Buffer.alloc(createStreamLayout.span)

    const encodedUIntArray = new TextEncoder().encode(createStreamData.name)
    let streamNameBuffer = Buffer.alloc(64).fill(
      encodedUIntArray,
      0,
      encodedUIntArray.byteLength
    )

    const decodedData = {
      start_time: createStreamData.start.toBuffer(),
      net_amount_deposited: createStreamData.depositedAmount.toBuffer(),
      period: createStreamData.period.toBuffer(),
      amount_per_period: createStreamData.amountPerPeriod.toBuffer(),
      cliff: createStreamData.cliff.toBuffer(),
      cliff_amount: createStreamData.cliffAmount.toBuffer(),
      cancelable_by_sender: createStreamData.cancelableBySender,
      cancelable_by_recipient: createStreamData.cancelableByRecipient,
      automatic_withdrawal: createStreamData.automaticWithdrawal,
      transferable_by_sender: createStreamData.transferableBySender,
      transferable_by_recipient: createStreamData.transferableByRecipient,
      can_topup: createStreamData.canTopup,
      stream_name: streamNameBuffer,
      withdraw_frequency: createStreamData.withdrawFrequency.toBuffer(),
      recipient: createStreamData.recipient.toBuffer(),
      partner: createStreamData.partner.toBuffer(),
    }
    const encodeLength = createStreamLayout.encode(decodedData, bufferData)
    bufferData = bufferData.slice(0, encodeLength)
    bufferData = Buffer.concat([
      Buffer.from(sha256.digest('global:create_v2')).slice(0, 8),
      bufferData,
    ])
    const signers: Keypair[] = [strmMetadata]
    const tx = new TransactionInstruction({
      keys,
      programId: strmProgram,
      data: bufferData,
    })
    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
      prerequisiteInstructions: prerequisiteInstructions,
      shouldSplitIntoSeparateTxs: true,
      signers
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
      <Input
        label="Token governance"
        value={form.tokenAccount}
        type="string"
        onChange={setTokenAccount}
      />
    </>
  )
}

export default CreateStream
