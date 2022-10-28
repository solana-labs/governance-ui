import React, { useContext, useEffect, useState } from 'react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Stream } from '@mean-dao/msp'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'

import Input from '@components/inputs/Input'
import {
  MeanTransferStream,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import getMeanTransferStreamInstruction from '@utils/instructions/Mean/getMeanTransferStreamInstruction'
import { getMeanTransferStreamSchema } from '@utils/validations'

import { NewProposalContext } from '../../../new'
import SelectStream from './SelectStream'

interface Props {
  index: number
  governance: ProgramAccount<Governance> | null
}

const MeanTransferStreamComponent = ({ index, governance }: Props) => {
  // form
  const [form, setForm] = useState<MeanTransferStream>({
    governedTokenAccount: undefined,
    stream: undefined,
    destination: undefined,
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }, restForm = {}) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value, ...restForm })
  }

  // instruction
  const connection = useWalletStore((s) => s.connection)

  const schema = getMeanTransferStreamSchema()
  const { handleSetInstructions } = useContext(NewProposalContext)

  const getInstruction = async (): Promise<UiInstruction> => {
    return await getMeanTransferStreamInstruction({
      connection,
      form,
      setFormErrors,
      schema,
    })
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  // treasury

  const shouldBeGoverned = index !== 0 && !!governance
  const formStream = form.stream as Stream | undefined

  // governedTokenAccount

  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()

  useEffect(() => {
    const value =
      formStream &&
      governedTokenAccountsWithoutNfts.find(
        (acc) =>
          acc.governance.pubkey.toBase58() ===
            formStream.treasurer.toString() && acc.isSol
      )
    setForm((prevForm) => ({
      ...prevForm,
      governedTokenAccount: value,
    }))
  }, [JSON.stringify(governedTokenAccountsWithoutNfts), formStream])

  return (
    <React.Fragment>
      <SelectStream
        label="Select streaming account source"
        onChange={(stream) => {
          handleSetForm({ value: stream, propertyName: 'stream' })
        }}
        value={formStream}
        error={formErrors['stream']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />
      <Input
        label="New stream owner"
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
    </React.Fragment>
  )
}

export default MeanTransferStreamComponent
