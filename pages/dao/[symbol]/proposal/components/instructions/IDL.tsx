import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import { validateInstruction } from '@utils/instructionTools'
import {
  // Base64InstructionForm,
  IDLForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
// import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import * as anchor from '@project-serum/anchor'
import { IdlInstruction } from '@project-serum/anchor/src/idl'
import { Connection, ConfirmOptions } from '@solana/web3.js'
// import { validateBuffer } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useRealm from '@hooks/useRealm'

const IDLInstructions = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  console.log(governance)
  const wallet = useWalletStore((s) => s.current)
  // const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const shouldBeGoverned = index !== 0 && governance
  const { assetAccounts } = useGovernanceAssets()
  const { ownVoterWeight } = useRealm()
  const [form, setForm] = useState<IDLForm>({
    governedAccount: undefined,
    programID: '',
    selectedInstruction: '',
    instructionsToSubmit: {},
  })
  const [formErrors, setFormErrors] = useState({})
  const [programInstructions, setProgramInstructions] = useState<
    IdlInstruction[]
  >([])
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
    {
      !form.programID && fetchIDL(wallet! as any, testConnection, value)
    } // TODO test to see if it breaks on 2nd IDL input and then switch instructions
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (isValid && form.programID && wallet?.publicKey) {
      serializedInstruction = form.programID // TODO Make this serialized instruction
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      // customHoldUpTime: form.holdUpTime,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    base64: yup
      .string()
      .required('Instruction is required')
      .test('base64Test', 'Invalid base64', function (val: string) {
        if (val) {
          try {
            getInstructionDataFromBase64(val)
            return true
          } catch (e) {
            return false
          }
        } else {
          return this.createError({
            message: `Instruction is required`,
          })
        }
      }),
  })
  // const validateAmountOnBlur = () => {
  //   const value = form.programID

  //   handleSetForm({
  //     value: value,
  //     propertyName: 'holdUpTime',
  //   })
  // }

  const opts = {
    preflightCommitment: 'processed' as ConfirmOptions,
  }
  const endpoint = 'https://api.devnet.solana.com' // TODO make this dynamic based on whether devnet or mainnet
  const testConnection = new anchor.web3.Connection(
    endpoint,
    opts.preflightCommitment
  )

  async function fetchIDL(
    anchorWallet: any,
    connection: Connection,
    idl: string
  ) {
    const provider = new anchor.Provider(connection, anchorWallet, {
      preflightCommitment: 'recent',
    })
    const fetchedIDL = await anchor.Program.fetchIdl(idl, provider)
    setProgramInstructions(fetchedIDL!.instructions)
    console.log('fetchedIDL', fetchedIDL)
  }
  console.log('form', form)

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={assetAccounts.filter((x) =>
          ownVoterWeight.canCreateProposal(x.governance.account.config)
        )}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Textarea
        label="Program ID"
        placeholder="Program ID"
        wrapperClassName="mb-5"
        value={form.programID}
        onChange={(event) => {
          handleSetForm({
            value: event.target.value,
            propertyName: 'programID',
          })
        }}
        error={formErrors['programID']}
      />
      {form.programID && (
        <Select
          label="Program Instructions"
          placeholder="Select Program Instructions"
          value={form.selectedInstruction}
          onChange={(value) => {
            handleSetForm({ value: value, propertyName: 'selectedInstruction' })
          }}
        >
          {programInstructions.map((x) => {
            return (
              <Select.Option key={x.name} value={x.name}>
                {x.name}
              </Select.Option>
            )
          })}
        </Select>
      )}
      {form.selectedInstruction &&
        programInstructions
          .filter((obj) => {
            return obj.name === form.selectedInstruction
          })
          .map((account) => {
            return account.args.map((args, idx) => {
              if (args) {
                return (
                  <Textarea
                    key={idx}
                    label={args.name}
                    placeholder={args.type}
                    value={form.instructionsToSubmit[args.name]}
                    onChange={(event) => {
                      handleSetForm({
                        value: {
                          ...form['instructionsToSubmit'],
                          [args.name]: event.target.value,
                        },
                        propertyName: 'instructionsToSubmit',
                      })
                    }}
                  ></Textarea>
                )
              }
            })
          })}
      {form.selectedInstruction &&
        programInstructions
          .filter((obj) => {
            return obj.name === form.selectedInstruction
          })
          .map((account) => {
            return account.accounts.map((actualaccount, idx) => {
              return (
                <Textarea
                  key={idx}
                  label={actualaccount.name}
                  placeholder={'wallet/program id'}
                  value={form.instructionsToSubmit[actualaccount.name]}
                  onChange={(event) => {
                    handleSetForm({
                      value: {
                        ...form['instructionsToSubmit'],
                        [actualaccount.name]: event.target.value,
                      },
                      propertyName: 'instructionsToSubmit',
                    })
                  }}
                ></Textarea>
              )
            })
          })}
      {/* TODO make sure programID is valid */}
    </>
  )
}

export default IDLInstructions
