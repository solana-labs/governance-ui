import React, { /* useContext, useEffect, */ useState } from 'react'
// import * as yup from 'yup'
import {
  // getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
// import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
// import { validateInstruction } from '@utils/instructionTools'
import {
  // Base64InstructionForm,
  IDLForm,
  // UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

// import { NewProposalContext } from '../../new'
// import GovernedAccountSelect from '../GovernedAccountSelect'
// import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import * as anchor from '@project-serum/anchor'
import { IdlInstruction } from '@project-serum/anchor/src/idl'
import { /* Keypair, */ Connection, ConfirmOptions } from '@solana/web3.js'
// import { useAnchorWallet } from '@solana/wallet-adapter-react'
// import { NodeWallet } from '@blockworks-foundation/voter-stake-registry-client/node_modules/@project-serum/anchor/dist/cjs/provider'

const IDLInstructions = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  console.log(index, governance)
  const wallet = useWalletStore((s) => s.current)
  // const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  // const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<IDLForm>({
    programID: '',
    selectedInstruction: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [programInstructions, setProgramInstructions] = useState<
    IdlInstruction[]
  >([])
  // const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
    {
      !form.programID && fetchIDL(wallet! as any, testConnection, value)
    } // TODO test to see if it breaks on 2nd IDL input and then switch instructions
  }
  // async function getInstruction(): Promise<UiInstruction> {
  //   const isValid = await validateInstruction({ schema, form, setFormErrors })
  //   let serializedInstruction = ''
  //   if (isValid && form.programID && wallet?.publicKey) {
  //     serializedInstruction = form.programID
  //   }
  //   const obj: UiInstruction = {
  //     serializedInstruction: serializedInstruction,
  //     isValid,
  //     governance: form.governedAccount?.governance,
  //     customHoldUpTime: form.holdUpTime,
  //   }
  //   return obj
  // }
  // useEffect(() => {
  //   handleSetInstructions(
  //     { governedAccount: form.governedAccount?.governance, getInstruction },
  //     index
  //   )
  // }, [form])
  // const schema = yup.object().shape({
  //   programID: yup.string().required('Program ID is required'),
  // .test('base64Test', 'Invalid base64', function (val: string) {
  //   if (val) {
  //     try {
  //       getInstructionDataFromBase64(val)
  //       return true
  //     } catch (e) {
  //       return false
  //     }
  //   } else {
  //     return this.createError({
  //       message: `Instruction is required`,
  //     })
  //   }
  // }),
  // })
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
    console.log('fetchedIDL', fetchedIDL!.instructions)
    // console.log("test", fetchedIDL!.instructions.filter((obj) => {return obj.name === "mintNft"}))
  }

  return (
    <>
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
            console.log('account', account)
            return account.accounts.map((actualaccount, idx) => {
              return (
                <Select
                  key={idx}
                  label={actualaccount.name}
                  placeholder={'wallet/program id'}
                  value={''}
                  onChange={() => {}}
                ></Select>
              )
            })

            //   return (
            //     <Select label={account.name} placeholder={account.name} value={"test"} onChange={() => {}}>

            //       {console.log(account)}
            //     </Select>

            //   )
          })}
      {/* TODO make sure programID is valid */}
    </>
  )
}

export default IDLInstructions
