import React, { useEffect, useState } from 'react'
import {
  ComponentInstructionData,
  EmptyInstructionForm,
  Instructions,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { validateInstruction } from '@utils/instructionTools'
import Button from '@components/Button'
import TokenBalanceCard from '@components/TokenBalanceCard'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import VoteBySwitch from '../VoteBySwitch'
import useRealm from '@hooks/useRealm'
import { getCustomNoneSchema } from '@utils/validations'
import { handlePropose } from 'actions/handleCreateProposal'

export type Base64InstructionTypeForm = {
  governedAccount: any | undefined
  base64: string
  holdUpTime: number
  title?: string
  description?: string
  voteByCouncil?: boolean
}

export interface NoneInstructions extends EmptyInstructionForm {
  title?: string
  description?: string
}

const CustomInstruction = ({
  index,
  governance,
  setGovernance,
  callback,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  setGovernance: any
  callback: any
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection)
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)

  const realmData = useRealm()

  const { canChooseWhoVote } = realmData

  const shouldBeGoverned = index !== 0 && governance

  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
    getAvailableInstructions,
  } = useGovernanceAssets()

  const availableInstructions = getAvailableInstructions()
  const initialInstruction = availableInstructions.find(
    (instruction) =>
      instruction.id === (!custom ? Instructions.Base64 : Instructions.None)
  )

  const [formErrors, setFormErrors] = useState({})
  const [custom, setCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)

  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])

  const [form, setForm] = useState<Base64InstructionTypeForm>({
    governedAccount: undefined,
    base64: '',
    holdUpTime: 0,
    title: '',
    description: '',
    voteByCouncil,
  })

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: initialInstruction }])

  useEffect(() => {
    console.log('000', instructionsData[0])
    // setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.pubkey])

  useEffect(() => {
    const firstInstruction = instructionsData[0]

    if (firstInstruction && firstInstruction.governedAccount) {
      setGovernance(firstInstruction.governedAccount)
    }
  }, [instructionsData[0]])

  useEffect(() => {
    const prepGovernances = async () => {
      const mintWithGovernances = await getMintWithGovernances()

      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )

        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )

        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }

        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }

        return {
          governance: gov,
        }
      })

      setGovernedAccounts(matchedGovernances)
    }

    prepGovernances()
  }, [])

  const schema = getCustomNoneSchema({ custom })

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

    const isValid = await validateInstruction({
      schema,
      form,
      setFormErrors,
    })

    let serializedInstruction = ''

    if (
      isValid &&
      form.governedAccount?.governance?.info &&
      wallet?.publicKey
    ) {
      serializedInstruction = form.base64
    }

    const obj: UiInstruction = {
      serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdUpTime,
    }

    instructions.push(obj)

    return instructions
  }

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    console.log(newInstructions)

    setInstructions(newInstructions)
  }

  const validateAmountOnBlur = () => {
    const value = form.holdUpTime

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(0),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed()
      ),
      propertyName: 'holdUpTime',
    })
  }

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.governedAccount?.governance.pubkey
    )) as ProgramAccount<Governance>
  }

  const proposalTitle = !custom
    ? 'Custom instruction proposal'
    : 'Vote only proposal'

  const confirmPropose = async () => {
    return await handlePropose({
      getInstruction,
      form,
      schema,
      connection,
      callback,
      governance: form.governedAccount?.governance,
      realmData,
      wallet,
      getSelectedGovernance,
      setIsLoading,
      proposalTitle,
    })
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )

    handleSetForm({
      value: governedAccounts[0],
      propertyName: 'governedAccount',
    })
  }, [])

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex lg:flex-row flex-col justify-between items-start">
        <div className="w-full flex lg:mb-0 mb-20 flex-col gap-y-5 justify-start items-start lg:max-w-xl rounded-xl">
          <VoteBySwitch
            tooltip="You can choose if you want to customize your proposal using a serialized instruction or if it will be for vote only. Enable for vote only and disable to customize."
            label="Vote only"
            disabled={!connected}
            checked={custom}
            onChange={() => setCustom(!custom)}
          />

          <GovernedAccountSelect
            noMaxWidth
            useDefaultStyle={false}
            className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            label="Governance"
            governedAccounts={governedAccounts as GovernedMultiTypeAccount[]}
            onChange={(value) => {
              handleSetForm({ value, propertyName: 'governedAccount' })
            }}
            value={form.governedAccount || governedAccounts[0]}
            error={formErrors['governedAccount']}
            shouldBeGoverned={shouldBeGoverned}
            governance={governance}
          />

          {!custom && (
            <>
              <Input
                noMaxWidth
                useDefaultStyle={false}
                className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
                wrapperClassName="my-6 w-full"
                min={0}
                label="Hold up time (days)"
                value={form.holdUpTime}
                type="number"
                onChange={(event) => {
                  handleSetForm({
                    value: event.target.value,
                    propertyName: 'holdUpTime',
                  })
                }}
                step={1}
                error={formErrors['holdUpTime']}
                onBlur={validateAmountOnBlur}
              />

              <div className="w-full flex items-center justify-center gap-x-4">
                <Textarea
                  noMaxWidth
                  useDefaultStyle={false}
                  className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
                  wrapperClassName="mb-6 w-full"
                  label="Instruction"
                  placeholder="Base64 encoded serialized Solana instruction"
                  value={form.base64}
                  onChange={(event) =>
                    handleSetForm({
                      value: event.target.value,
                      propertyName: 'base64',
                    })
                  }
                />
              </div>
            </>
          )}

          <VoteBySwitch
            disabled={!canChooseWhoVote}
            checked={voteByCouncil}
            onChange={() => setVoteByCouncil(!voteByCouncil)}
          />

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={confirmPropose}
            disabled={
              isLoading || !form.governedAccount || (!custom && !form.base64)
            }
          >
            Create proposal
          </Button>
        </div>

        <div className="lg:max-w-xs max-w-xl w-full">
          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="my-6"
            label="Title of your proposal"
            placeholder="Title of your proposal (optional)"
            value={form.title || proposalTitle}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'title',
              })
            }
          />

          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-6"
            label="Description"
            placeholder="Describe your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
              })
            }
          />

          <div className="mt-20">
            <TokenBalanceCard />
          </div>
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default CustomInstruction
