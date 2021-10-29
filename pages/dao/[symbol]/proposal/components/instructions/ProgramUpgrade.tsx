/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  Instruction,
  ProgramUpgradeForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useInstructions from '@hooks/useInstructions'
import ProgramGovernedAccountSelect from '../ProgramGovernedAccountSelect'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { BPF_UPGRADE_LOADER_ID } from '@utils/tokens'
import { serializeInstructionToBase64 } from '@models/serialisation'

const ProgramUpgrade = ({
  index,
  governance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
}) => {
  //const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountType } = useInstructions()
  const programGovernances = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ProgramUpgradeForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    bufferAddress: '',
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
  async function getInstruction(): Promise<Instruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.info &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createUpgradeInstruction(
        BPF_UPGRADE_LOADER_ID,
        form.governedAccount.info.governedAccount,
        new PublicKey(form.bufferAddress),
        form.governedAccount.pubkey,
        wallet!.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: Instruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governedAccount: form.governedAccount,
    }
    return obj
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  //   useEffect(() => {
  //     if (form.destinationAccount) {
  //       debounce.debounceFcn(async () => {
  //         const pubKey = tryParseKey(form.destinationAccount)
  //         if (pubKey) {
  //           const account = await tryGetTokenAccount(connection.current, pubKey)
  //           setDestinationAccount(account ? account : null)
  //         } else {
  //           setDestinationAccount(null)
  //         }
  //       })
  //     } else {
  //       setDestinationAccount(null)
  //     }
  //   }, [form.destinationAccount])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount, getInstruction },
      index
    )
  }, [form])

  //   const destinationAccountName =
  //     destinationAccount?.publicKey &&
  //     getAccountName(destinationAccount?.account.address)
  const schema = yup.object().shape({
    // destinationAccount: yup
    //   .string()
    //   .test(
    //     'accountTests',
    //     'Account validation error',
    //     async function (val: string) {
    //       if (val) {
    //         try {
    //           if (
    //             form.governedAccount?.token?.account.address.toBase58() == val
    //           ) {
    //             return this.createError({
    //               message: `Destination account address can't be same as source account`,
    //             })
    //           }
    //           await validateDestinationAccAddress(
    //             connection,
    //             val,
    //             form.governedAccount?.token?.account.address
    //           )
    //           return true
    //         } catch (e) {
    //           return this.createError({
    //             message: `${e}`,
    //           })
    //         }
    //       } else {
    //         return this.createError({
    //           message: `Destination account is required`,
    //         })
    //       }
    //     }
    //   ),
    governedAccount: yup
      .object()
      .nullable()
      .required('Source account is required'),
  })

  return (
    <>
      <ProgramGovernedAccountSelect
        programGovernances={programGovernances}
        onChange={(value) => {
          console.log(value)
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount?.info.governedAccount.toBase58()}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></ProgramGovernedAccountSelect>
    </>
  )
}

export default ProgramUpgrade
