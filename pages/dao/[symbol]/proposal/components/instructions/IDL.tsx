import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import { validateInstruction } from '@utils/instructionTools'
import {
  Base64InstructionForm,
  IDLForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import * as anchor from '@project-serum/anchor'
import { Keypair, Connection, ConfirmOptions } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { NodeWallet } from '@blockworks-foundation/voter-stake-registry-client/node_modules/@project-serum/anchor/dist/cjs/provider'

const IDLInstructions = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  // const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  // const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<IDLForm>({
    programID: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [programInstructions, setProgramInstructions] = useState([])
  // const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
    fetchIDL(wallet! as any, testConnection, value)
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (isValid && form.programID && wallet?.publicKey) {
      serializedInstruction = form.programID
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdUpTime,
    }
    return obj
  }
  // useEffect(() => {
  //   handleSetInstructions(
  //     { governedAccount: form.governedAccount?.governance, getInstruction },
  //     index
  //   )
  // }, [form])
  const schema = yup.object().shape({
    programID: yup.string().required('Program ID is required'),
    // .test('base64Test', 'Invalid base64', function (val: string) { // TODO
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
  })
  const validateAmountOnBlur = () => {
    const value = form.programID

    handleSetForm({
      value: value,
      propertyName: 'holdUpTime',
    })
  }

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

    console.log('fetchedIDL', fetchedIDL)
    setProgramInstructions([fetchedIDL!.instructions as Array])
    // setProgramInstructions(prevState => [...prevState, fetchedIDL.instructions])
    console.log('programInstructions', programInstructions)
    // return (<h1>fetchedIDL {console.log("reached")}</h1>);
  }

  return (
    <>
      <Textarea
        label="Program ID cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ" // TODO remove candy machine id
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
      {/* {form.programID && (
      programInstructions.map((x) => {
        return(
          <Select.Option key={x.instructions} value={1}>
                {x.instructions}
          </Select.Option>
        )
      }))}  */}
      {/* TODO make sure programID is valid */}
    </>
  )
}

export default IDLInstructions
