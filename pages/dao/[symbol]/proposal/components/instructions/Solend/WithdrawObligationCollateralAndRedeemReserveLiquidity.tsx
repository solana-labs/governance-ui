/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import BigNumber from 'bignumber.js'
import * as yup from 'yup'
import { BN } from '@project-serum/anchor'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Select from '@components/inputs/Select'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import SolendConfiguration from '@tools/sdk/solend/configuration'
import { withdrawObligationCollateralAndRedeemReserveLiquidity } from '@tools/sdk/solend/withdrawObligationCollateralAndRedeemReserveLiquidity'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  WithdrawObligationCollateralAndRedeemReserveLiquidityForm,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const WithdrawObligationCollateralAndRedeemReserveLiquidity = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [
    form,
    setForm,
  ] = useState<WithdrawObligationCollateralAndRedeemReserveLiquidityForm>({
    uiAmount: '0',
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

    const tx = await withdrawObligationCollateralAndRedeemReserveLiquidity({
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
      ...(form.destinationLiquidity && {
        destinationLiquidity: new PublicKey(form.destinationLiquidity),
      }),
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
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
    mintName: yup.string().required('Token Name is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
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
        label="Amount to withdraw"
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

      <Input
        label="Destination Account (Optional - default to governance ATA"
        value={form.destinationLiquidity}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationLiquidity',
          })
        }
        error={formErrors['destinationLiquidity']}
      />
    </>
  )
}

export default WithdrawObligationCollateralAndRedeemReserveLiquidity
