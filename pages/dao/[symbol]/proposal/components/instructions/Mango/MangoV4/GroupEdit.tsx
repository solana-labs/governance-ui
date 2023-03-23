import React, { useContext, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { BN } from '@coral-xyz/anchor'
import { getChangedValues, getNullOrTransform } from '@utils/mangoV4Tools'
import AdvancedOptionsDropdown from '@components/NewRealmWizard/components/AdvancedOptionsDropdown'
import Switch from '@components/Switch'

const keyToLabel = {
  admin: 'Admin',
  fastListingAdmin: 'Fast Listing Admin',
  securityAdmin: 'Security Admin',
  testing: 'Testing',
  version: 'Version',
  depositLimitQuote: 'Deposit limit quote',
  feePayWithMngo: 'Fee Pay With MNGO',
  feesMngoBonusRate: 'Fees MNGO Bonus Rate',
  feesSwapMangoAccount: 'Fees Swap Mango Account',
  feesMngoTokenIndex: 'Fees MNGO Token Index',
  feesExpiryInterval: 'Fees Expiry Interval',
}

type GroupEditForm = {
  governedAccount: AssetAccount | null
  admin: string
  fastListingAdmin: string
  securityAdmin: string
  testing: number
  version: number
  depositLimitQuote: number
  feePayWithMngo: boolean | null
  feesMngoBonusRate: number | null
  feesSwapMangoAccount: string | null
  feesMngoTokenIndex: number | null
  feesExpiryInterval: number | null
  holdupTime: number
}

const defaultFormValues: GroupEditForm = {
  governedAccount: null,
  admin: '',
  fastListingAdmin: '',
  securityAdmin: '',
  testing: 0,
  version: 0,
  depositLimitQuote: 0,
  feePayWithMngo: false,
  feesMngoBonusRate: 0,
  feesSwapMangoAccount: '',
  feesMngoTokenIndex: 0,
  feesExpiryInterval: 0,
  holdupTime: 0,
}

const GroupEdit = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { mangoClient, mangoGroup, getAdditionalLabelInfo } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      ((mangoGroup?.admin &&
        x.extensions.transferAddress?.equals(mangoGroup.admin)) ||
        (mangoGroup?.securityAdmin &&
          x.extensions.transferAddress?.equals(mangoGroup.securityAdmin)))
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [originalFormValues, setOriginalFormValues] = useState<GroupEditForm>({
    ...defaultFormValues,
  })
  const [form, setForm] = useState<GroupEditForm>({ ...defaultFormValues })
  const [forcedValues, setForcedValues] = useState<string[]>([])
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
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const values = getChangedValues<GroupEditForm>(
        originalFormValues,
        form,
        forcedValues
      )
      //Mango instruction call and serialize
      const ix = await mangoClient!.program.methods
        .groupEdit(
          getNullOrTransform(values.admin, PublicKey),
          getNullOrTransform(values.fastListingAdmin, PublicKey),
          getNullOrTransform(values.securityAdmin, PublicKey),
          getNullOrTransform(values.testing, null, Number),
          getNullOrTransform(values.version, null, Number),
          getNullOrTransform(values.depositLimitQuote, BN),
          getNullOrTransform(values.feePayWithMngo, null, Boolean),
          getNullOrTransform(values.feesMngoBonusRate, null, Number),
          getNullOrTransform(values.feesSwapMangoAccount, PublicKey),
          getNullOrTransform(values.feesMngoTokenIndex, null, Number),
          getNullOrTransform(values.feesExpiryInterval, BN)
        )
        .accounts({
          group: mangoGroup!.publicKey,
          admin: mangoGroup!.admin,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
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
  }, [form, forcedValues])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    admin: yup
      .string()
      .required()
      .test('is-valid-address', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    fastListingAdmin: yup
      .string()
      .required()
      .test('is-valid-address1', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    securityAdmin: yup
      .string()
      .required()
      .test('is-valid-address2', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    feesSwapMangoAccount: yup
      .string()
      .nullable()
      .test('is-valid-address3', 'Please enter a valid PublicKey', (value) =>
        value ? validatePubkey(value) : true
      ),
    testing: yup.string().required(),
    version: yup.string().required(),
    depositLimitQuote: yup.string().required(),
  })

  useEffect(() => {
    const getGroupParams = async () => {
      const vals = {
        ...form,
        admin: mangoGroup!.admin.toBase58(),
        fastListingAdmin: mangoGroup!.fastListingAdmin.toBase58(),
        securityAdmin: mangoGroup!.securityAdmin.toBase58(),
        testing: mangoGroup!.testing,
        version: mangoGroup!.version,
        feePayWithMngo: mangoGroup!.buybackFees,
        feesMngoBonusRate: mangoGroup!.buybackFeesMngoBonusFactor,
        feesSwapMangoAccount: mangoGroup!.buybackFeesSwapMangoAccount?.toBase58(),
        feesMngoTokenIndex: mangoGroup!.mngoTokenIndex,
        feesExpiryInterval: mangoGroup!.buybackFeesExpiryInterval?.toNumber(),
      }
      setForm({
        ...vals,
      })
      setOriginalFormValues({ ...vals })
    }
    if (mangoGroup) {
      getGroupParams()
    }
  }, [mangoGroup?.publicKey.toBase58()])

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
      label: keyToLabel['admin'],
      subtitle: getAdditionalLabelInfo('admin'),
      initialValue: form.admin,
      type: InstructionInputType.INPUT,
      name: 'admin',
    },
    {
      label: keyToLabel['fastListingAdmin'],
      subtitle: getAdditionalLabelInfo('fastListingAdmin'),
      initialValue: form.fastListingAdmin,
      type: InstructionInputType.INPUT,
      name: 'fastListingAdmin',
    },
    {
      label: keyToLabel['securityAdmin'],
      subtitle: getAdditionalLabelInfo('securityAdmin'),
      initialValue: form.securityAdmin,
      type: InstructionInputType.INPUT,
      name: 'securityAdmin',
    },
    {
      label: keyToLabel['testing'],
      subtitle: getAdditionalLabelInfo('testing'),
      initialValue: form.testing,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'testing',
    },
    {
      label: keyToLabel['version'],
      subtitle: getAdditionalLabelInfo('version'),
      initialValue: form.version,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'version',
    },
    {
      label: keyToLabel['depositLimitQuote'],
      subtitle: getAdditionalLabelInfo('depositLimitQuote'),
      initialValue: form.depositLimitQuote,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'depositLimitQuote',
    },
    {
      label: keyToLabel['feePayWithMngo'],
      initialValue: form.feePayWithMngo,
      subtitle: getAdditionalLabelInfo('buybackFees'),
      type: InstructionInputType.SWITCH,
      name: 'feePayWithMngo',
    },
    {
      label: keyToLabel['feesMngoBonusRate'],
      subtitle: getAdditionalLabelInfo('buybackFeesMngoBonusFactor'),
      initialValue: form.feesMngoBonusRate,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feesMngoBonusRate',
    },
    {
      label: keyToLabel['feesSwapMangoAccount'],
      subtitle: getAdditionalLabelInfo('buybackFeesSwapMangoAccount'),
      initialValue: form.feesSwapMangoAccount,
      type: InstructionInputType.INPUT,
      name: 'feesSwapMangoAccount',
    },
    {
      label: keyToLabel['feesMngoTokenIndex'],
      subtitle: getAdditionalLabelInfo('mngoTokenIndex'),
      initialValue: form.feesMngoTokenIndex,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feesMngoTokenIndex',
    },
    {
      label: keyToLabel['feesExpiryInterval'],
      subtitle: getAdditionalLabelInfo('feesExpiryInterval'),
      initialValue: form.feesExpiryInterval,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'feesExpiryInterval',
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
  ]

  return (
    <>
      {form && (
        <>
          <InstructionForm
            outerForm={form}
            setForm={setForm}
            inputs={inputs}
            setFormErrors={setFormErrors}
            formErrors={formErrors}
          ></InstructionForm>
          <AdvancedOptionsDropdown title="More">
            <h3>Force values</h3>
            <div>
              {Object.keys(defaultFormValues)
                .filter((x) => x !== 'governedAccount')
                .filter((x) => x !== 'holdupTime')
                .map((key) => (
                  <div className="text-sm mb-3" key={key}>
                    <div className="mb-2">{keyToLabel[key]}</div>
                    <div className="flex flex-row text-xs items-center">
                      <Switch
                        checked={
                          forcedValues.find((x) => x === key) ? true : false
                        }
                        onChange={(checked) => {
                          if (checked) {
                            setForcedValues([...forcedValues, key])
                          } else {
                            setForcedValues([
                              ...forcedValues.filter((x) => x !== key),
                            ])
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </AdvancedOptionsDropdown>
        </>
      )}
    </>
  )
}

export default GroupEdit
