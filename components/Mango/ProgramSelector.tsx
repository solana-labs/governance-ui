import { useEffect, useState } from 'react'
import {
  BOOST_MAINNET_GROUP,
  MANGO_BOOST_PROGRAM_ID,
  MANGO_V4_MAINNET_GROUP,
} from '@hooks/useMangoV4'
import { MANGO_V4_ID } from '@blockworks-foundation/mango-v4'
import { PublicKey } from '@metaplex-foundation/js'
import useProgramSelector from './useProgramSelector'
import { InstructionInputType } from 'pages/dao/[symbol]/proposal/components/instructions/inputInstructionType'
import InstructionForm, {
  InstructionInput,
} from 'pages/dao/[symbol]/proposal/components/instructions/FormCreator'

type Program = { name: string; val: PublicKey; group: PublicKey }

interface ProgramSelectorForm {
  program: Program
}

const ProgramSelector = ({
  programSelectorHook,
}: {
  programSelectorHook: ReturnType<typeof useProgramSelector>
}) => {
  const programs: Program[] = [
    {
      name: 'Mango v4 program',
      val: MANGO_V4_ID['mainnet-beta'],
      group: MANGO_V4_MAINNET_GROUP,
    },
    {
      name: 'JLP boost program',
      val: MANGO_BOOST_PROGRAM_ID,
      group: BOOST_MAINNET_GROUP,
    },
  ]
  const [form, setForm] = useState<ProgramSelectorForm>({
    program: programs[0],
  })

  useEffect(() => {
    if (programSelectorHook.setProgram) {
      programSelectorHook.setProgram(form.program)
    }
  }, [form.program, programSelectorHook])

  const inputs: InstructionInput[] = [
    {
      label: 'Program',
      name: 'program',
      type: InstructionInputType.SELECT,
      initialValue: form.program,
      options: programs,
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={() => null}
          formErrors={{}}
        ></InstructionForm>
      )}
    </>
  )
}

export default ProgramSelector
