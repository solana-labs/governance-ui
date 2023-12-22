/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, { InstructionInput } from '../../FormCreator'
import { InstructionInputType } from '../../inputInstructionType'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { ReferralProvider } from '@jup-ag/referral-sdk'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { JUPITER_REFERRAL_PK } from '@tools/constants'
import ForwarderProgram, {
  useForwarderProgramHelpers,
} from '@components/ForwarderProgram/ForwarderProgram'

interface TokenRegisterTrustlessForm {
  governedAccount: AssetAccount | null
  mintPk: string
  oraclePk: string
  name: string
  tokenIndex: number
  holdupTime: number
}

const TokenRegisterTrustless = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletOnePointOh()
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.fastListingAdmin &&
        x.extensions.transferAddress?.equals(mangoGroup?.fastListingAdmin)) ||
        (mangoGroup?.admin &&
          x.extensions.transferAddress?.equals(mangoGroup?.admin)))
  )
  const forwarderProgramHelpers = useForwarderProgramHelpers()
  const connection = useLegacyConnectionContext()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<TokenRegisterTrustlessForm>({
    governedAccount: null,
    mintPk: '',
    oraclePk: '',
    name: '',
    tokenIndex: 0,
    holdupTime: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    const additionalSerializedInstructions: string[] = []
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .tokenRegisterTrustless(Number(form.tokenIndex), form.name)
        .accounts({
          admin: form.governedAccount.extensions.transferAddress,
          group: mangoGroup!.publicKey,
          mint: new PublicKey(form.mintPk),
          oracle: new PublicKey(form.oraclePk),
          payer: form.governedAccount.extensions.transferAddress,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction()

      const rp = new ReferralProvider(connection.current)

      const tx = await rp.initializeReferralTokenAccount({
        payerPubKey: form.governedAccount.extensions.transferAddress!,
        referralAccountPubKey: JUPITER_REFERRAL_PK,
        mint: new PublicKey(form.mintPk),
      })
      const isExistingAccount = await connection.current.getAccountInfo(
        tx.referralTokenAccountPubKey
      )

      if (!isExistingAccount) {
        additionalSerializedInstructions.push(
          ...tx.tx.instructions.map((x) =>
            serializeInstructionToBase64(
              forwarderProgramHelpers.withForwarderWrapper(x)
            )
          )
        )
      }

      serializedInstruction = serializeInstructionToBase64(
        forwarderProgramHelpers.withForwarderWrapper(ix)
      )
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      additionalSerializedInstructions,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    form,
    forwarderProgramHelpers.form,
    forwarderProgramHelpers.withForwarderWrapper,
  ])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    oraclePk: yup
      .string()
      .required()
      .test('is-valid-address', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    mintPk: yup
      .string()
      .required()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    name: yup.string().required(),
    tokenIndex: yup.string().required(),
  })

  useEffect(() => {
    const tokenIndex =
      !mangoGroup || mangoGroup?.banksMapByTokenIndex.size === 0
        ? 0
        : Math.max(...[...mangoGroup!.banksMapByTokenIndex.keys()]) + 1
    setForm((prevForm) => ({
      ...prevForm,
      tokenIndex: tokenIndex,
    }))
  }, [mangoGroup])

  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Mint PublicKey',
      initialValue: form.mintPk,
      type: InstructionInputType.INPUT,
      name: 'mintPk',
    },
    {
      label: 'Oracle PublicKey',
      initialValue: form.oraclePk,
      type: InstructionInputType.INPUT,
      name: 'oraclePk',
    },
    {
      label: 'Token Name',
      initialValue: form.name,
      type: InstructionInputType.INPUT,
      name: 'name',
    },
    {
      label: `Token Index`,
      initialValue: form.tokenIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'tokenIndex',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
      <ForwarderProgram {...forwarderProgramHelpers}></ForwarderProgram>
    </>
  )
}

export default TokenRegisterTrustless
