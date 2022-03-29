/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import SolendConfiguration from '@tools/sdk/solend/configuration'
import { depositReserveLiquidityAndObligationCollateral } from '@tools/sdk/solend/depositReserveLiquidityAndObligationCollateral'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { DepositReserveLiquidityAndObligationCollateralForm } from '@utils/uiTypes/proposalCreationTypes'
import SelectOptionList from '../../SelectOptionList'
import { uiAmountToNativeBN } from '@tools/sdk/units'

const DepositReserveLiquidityAndObligationCollateral = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<DepositReserveLiquidityAndObligationCollateralForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
        uiAmount: 0,
      },
      schema: yup.object().shape({
        governedAccount: yup
          .object()
          .nullable()
          .required('Governed account is required'),
        mintName: yup.string().required('Token Name is required'),
        uiAmount: yup
          .number()
          .moreThan(0, 'Amount should be more than 0')
          .required('Amount is required'),
      }),
      buildInstruction: async function () {
        return depositReserveLiquidityAndObligationCollateral({
          obligationOwner: governedAccount!.governance.pubkey,
          liquidityAmount: uiAmountToNativeBN(
            form.uiAmount,
            SolendConfiguration.getSupportedMintInformation(form.mintName!)
              .decimals
          ),
          mintName: form.mintName!,
        })
      },
    }
  )

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  return (
    <>
      <Select
        label="Token Name"
        value={form.mintName}
        placeholder="Please select..."
        onChange={(value) => handleSetForm({ value, propertyName: 'mintName' })}
        error={formErrors['baseTokenName']}
      >
        <SelectOptionList list={SolendConfiguration.getSupportedMintNames()} />
      </Select>

      <Input
        label="Amount to deposit"
        value={form.uiAmount}
        type="number"
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
