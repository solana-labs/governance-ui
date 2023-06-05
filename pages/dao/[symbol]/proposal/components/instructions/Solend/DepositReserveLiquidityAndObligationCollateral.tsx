/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import * as yup from 'yup'

import { BN } from '@coral-xyz/anchor'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useRealm from '@hooks/useRealm'
import SolendConfiguration from '@tools/sdk/solend/configuration'
import { depositReserveLiquidityAndObligationCollateral } from '@tools/sdk/solend/depositReserveLiquidityAndObligationCollateral'
import { isFormValid } from '@utils/formValidation'
import {
  DepositReserveLiquidityAndObligationCollateralForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DepositReserveLiquidityAndObligationCollateral = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()

  const { assetAccounts } = useGovernanceAssets()
  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [
    form,
    setForm,
    // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  ] = useState<DepositReserveLiquidityAndObligationCollateralForm>({
    uiAmount: '0',
  })
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  const [formErrors, setFormErrors] = useState({})
  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
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
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.mintName
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await depositReserveLiquidityAndObligationCollateral({
      obligationOwner: form.governedAccount.governance.pubkey,
      liquidityAmount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(
            SolendConfiguration.getSupportedMintInformation(form.mintName)
              .decimals
          )
          .toString()
      ),
      mintName: form.mintName,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  // eslint-disable-next-line react-hooks/rules-of-hooks -- TODO this is potentially quite serious! please fix next time the file is edited, -@asktree
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

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    mintName: yup.string().required('Token Name is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Wallet"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Select
        label="Token Name"
        value={form.mintName}
        placeholder="Please select..."
        onChange={(value) => handleSetForm({ value, propertyName: 'mintName' })}
        error={formErrors['baseTokenName']}
      >
        {SolendConfiguration.getSupportedMintNames().map((value) => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Amount to deposit"
        value={form.uiAmount}
        type="string"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />
    </>
  )
}

export default DepositReserveLiquidityAndObligationCollateral
