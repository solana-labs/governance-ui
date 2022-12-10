import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Treasury } from '@mean-dao/msp'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from '@utils/formatting'
import getMeanCreateStreamInstruction from '@utils/instructions/Mean/getMeanCreateStreamInstruction'
import getMint from '@utils/instructions/Mean/getMint'
import { MeanCreateStream } from '@utils/uiTypes/proposalCreationTypes'
import { getMeanCreateStreamSchema } from '@utils/validations'
import React, { useContext, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../../new'
import SelectStreamingAccount from './SelectStreamingAccount'

const rateIntervalOptions = {
  0: { idx: 0, display: 'Per minute', value: 0 },
  1: { idx: 1, display: 'Per hour', value: 1 },
  2: { idx: 2, display: 'Per day', value: 2 },
  3: { idx: 3, display: 'Per week', value: 3 },
  4: { idx: 4, display: 'Per month', value: 4 },
  5: { idx: 5, display: 'Per year', value: 5 },
}

interface Props {
  index: number
  governance: ProgramAccount<Governance> | null
}

const getInitialStartDate = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const MeanCreateStreamComponent = ({ index, governance }: Props) => {
  // form
  const [form, setForm] = useState<MeanCreateStream>({
    governedTokenAccount: undefined,
    treasury: undefined,
    streamName: undefined,
    destination: undefined,
    mintInfo: undefined,
    allocationAssigned: undefined,
    rateAmount: undefined,
    rateInterval: 0,
    startDate: getInitialStartDate(),
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }, restForm = {}) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value, ...restForm })
  }

  // instruction
  const connection = useWalletStore((s) => s.connection)

  const schema = getMeanCreateStreamSchema({
    form,
    connection,
    mintInfo: form.mintInfo,
  })
  const { handleSetInstructions } = useContext(NewProposalContext)

  const getInstruction = () =>
    getMeanCreateStreamInstruction({
      connection,
      form,
      setFormErrors,
      schema,
    })

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  // treasury

  const shouldBeGoverned = index !== 0 && !!governance
  const formTreasury = form.treasury as Treasury | undefined

  // governedTokenAccount

  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  useEffect(() => {
    const value =
      formTreasury &&
      governedTokenAccountsWithoutNfts.find(
        (acc) =>
          acc.governance.pubkey.toBase58() ===
            formTreasury.treasurer.toString() && acc.isSol
      )
    setForm((prevForm) => ({
      ...prevForm,
      governedTokenAccount: value,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(governedTokenAccountsWithoutNfts), formTreasury])

  // mint info

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)

  useEffect(() => {
    setForm({
      ...form,
      mintInfo:
        formTreasury && getMint(governedTokenAccountsWithoutNfts, formTreasury),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.governedTokenAccount])

  // amount

  const validateAllocationAssignedOnBlur = () => {
    const value = form.allocationAssigned

    handleSetForm({
      value: parseFloat(
        Math.max(
          mintMinAmount,
          Math.min(Number.MAX_SAFE_INTEGER, value ?? 0)
        ).toFixed(currentPrecision)
      ),
      propertyName: 'allocationAssigned',
    })
  }

  const setAllocationAssigned = (event) => {
    const value = event.target.value
    handleSetForm({
      value,
      propertyName: 'allocationAssigned',
    })
  }

  // payment rate amount

  const validateRateAmountOnBlur = () => {
    const value = form.rateAmount

    handleSetForm({
      value: parseFloat(
        Math.max(
          mintMinAmount,
          Math.min(Number.MAX_SAFE_INTEGER, value ?? 0)
        ).toFixed(currentPrecision)
      ),
      propertyName: 'rateAmount',
    })
  }

  const setRateAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value,
      propertyName: 'rateAmount',
    })
  }

  // send on

  const setStartDate = (event) => {
    const value = event.target.value
    handleSetForm({
      value,
      propertyName: 'startDate',
    })
  }

  return (
    <React.Fragment>
      <SelectStreamingAccount
        label="Select streaming account source"
        onChange={(treasury) => {
          handleSetForm({ value: treasury, propertyName: 'treasury' })
        }}
        value={formTreasury}
        error={formErrors['treasury']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="Stream name"
        value={form.streamName}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'streamName',
          })
        }
        error={formErrors['streamName']}
      />
      <Input
        label="Destination account"
        value={form.destination}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value.trim(),
            propertyName: 'destination',
          })
        }
        error={formErrors['destination']}
      />
      <Input
        min={mintMinAmount}
        max={Number.MAX_SAFE_INTEGER}
        label="Amount to stream"
        value={form.allocationAssigned}
        type="number"
        onChange={setAllocationAssigned}
        step={mintMinAmount}
        error={formErrors['allocationAssigned']}
        onBlur={validateAllocationAssignedOnBlur}
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
            min={mintMinAmount}
            max={Number.MAX_SAFE_INTEGER}
            label="Payment rate amount"
            value={form.rateAmount}
            type="number"
            onChange={setRateAmount}
            step={mintMinAmount}
            error={formErrors['rateAmount']}
            onBlur={validateRateAmountOnBlur}
          />
        </div>
        <div style={{ width: '45%' }}>
          <Select
            label={'Payment rate interval'}
            onChange={(unitIdx) =>
              handleSetForm({
                value: unitIdx,
                propertyName: 'rateInterval',
              })
            }
            value={rateIntervalOptions[form.rateInterval].display}
          >
            {Object.values(rateIntervalOptions).map((option) => {
              return (
                <Select.Option key={option.idx} value={option.idx}>
                  {option.display}
                </Select.Option>
              )
            })}
          </Select>
        </div>
      </div>
      <Input
        label="Send on"
        value={form.startDate}
        error={formErrors['startDate']}
        type="datetime-local"
        onChange={setStartDate}
      />
    </React.Fragment>
  )
}

export default MeanCreateStreamComponent
