import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  Controller,
  IdentityDepository,
  USDC,
  USDC_DECIMALS,
  UXD,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client'
import Input from '@components/inputs/Input'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { uxdClient } from '@tools/sdk/uxdProtocol/uxdClient'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  UXDMintWithIdentityDepositoryForm,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { findATAAddrSync } from '@utils/ataTools'

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
const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  collateralAmount: yup
    .number()
    .moreThan(0, 'Collateral amount should be more than 0')
    .required('Collateral Amount is required'),
})

const MintWithIdentityDepository = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()

  const [form, setForm] = useState<UXDMintWithIdentityDepositoryForm>({
    governedAccount: undefined,
    collateralAmount: 0,
    uxdProgram: 'UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr',
  })

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
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account.governedAccount ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const uxdProgramId =
      form.governedAccount?.governance?.account.governedAccount
    const client = uxdClient(uxdProgramId)
    const authority = form.governedAccount.governance.pubkey
    const identityDepository = new IdentityDepository(
      USDC,
      'USDC',
      USDC_DECIMALS,
      uxdProgramId
    )
    const ix = client.createMintWithIdentityDepositoryInstruction(
      new Controller('UXD', UXD_DECIMALS, uxdProgramId),
      identityDepository,
      new PublicKey(form.uxdProgram),
      form.collateralAmount,
      { preflightCommitment: 'processed', commitment: 'processed' },
      wallet.publicKey
    )

    const prerequisiteInstructions: TransactionInstruction[] = []
    const [authorityUXDATA] = findATAAddrSync(authority, UXD)
    checkInitTokenAccount(
      authorityUXDATA,
      prerequisiteInstructions,
      connection,
      UXD,
      authority,
      wallet.publicKey
    )

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
      shouldSplitIntoSeparateTxs: true,
      prerequisiteInstructions,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  return (
    <>
      <GovernedAccountSelect
        label="Governed account"
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
        label="UXD Program"
        value={form.uxdProgram}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uxdProgram',
          })
        }
        error={formErrors['uxdProgram']}
      />

      <Input
        type="number"
        label="Collateral Amount (USDC)"
        value={form.collateralAmount}
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'collateralAmount',
          })
        }
        error={formErrors['collateralAmount']}
      />
    </>
  )
}

export default MintWithIdentityDepository
