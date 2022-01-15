import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from 'utils/validations'
import { useEffect, useState } from 'react'
import { MintForm, UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { getMintInstruction } from 'utils/instructionTools'
import AddMemberIcon from '@components/AddMemberIcon'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import TokenBalanceCard from '@components/TokenBalanceCard'
import { handlePropose } from 'actions/handleCreateProposal'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { notify } from '@utils/notifications'

interface AddMemberForm extends MintForm {
  description: string
  title: string
}

const AddMemberForm = ({
  close,
  callback,
}: {
  close?: any
  callback?: any
}) => {
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { getMintWithGovernances } = useGovernanceAssets()

  const realmData = useRealm()

  const router = useRouter()
  const { fmtUrlWithCluster } = useQueryContext()

  const { realmInfo, canChooseWhoVote, councilMint, realm } = realmData

  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<AddMemberForm>({
    destinationAccount: '',
    amount: 1,
    mintAccount: undefined,
    programId: programId?.toString(),
    description: '',
    title: 'Add council member',
  })

  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(councilMint!)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const proposalTitle = `Add council member ${form.destinationAccount}`

  const setAmount = (event) => {
    const value = event.target.value

    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  const schema = getMintSchema({ form, connection })

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

    const mintInstruction = await getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
    })

    instructions.push(mintInstruction)

    return instructions
  }

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.mintAccount?.governance?.pubkey
    )) as ProgramAccount<Governance>
  }

  useEffect(() => {
    const initForm = async () => {
      const response = await getMintWithGovernances()

      handleSetForm({
        value: response.find(
          (x) =>
            x.governance?.account.governedAccount.toBase58() ===
            realm?.account.config.councilMint?.toBase58()
        ),
        propertyName: 'mintAccount',
      })
    }

    initForm()
  }, [])

  const modalCallback = ({ url, error }) => {
    let newAddressURL = null

    if (url) {
      newAddressURL = fmtUrlWithCluster(url)
    }

    if (close) {
      if (error) {
        close()

        notify({
          type: 'error',
          message: 'Could not create proposal',
          description: `${error}`,
        })

        return
      }

      router.push(String(newAddressURL))

      return
    }
  }

  const confirmPropose = async () => {
    try {
      await handlePropose({
        getInstruction,
        form,
        schema,
        connection,
        callback: close ? modalCallback : callback,
        governance: form.mintAccount?.governance,
        realmData,
        wallet,
        getSelectedGovernance,
        setIsLoading,
      })
    } catch (error) {
      console.log('error adding member', error)
    }
  }

  return (
    <>
      {close ? (
        <>
          <div className="flex justify-start items-center gap-x-3">
            <AddMemberIcon className="w-8 mb-2" />

            <h2 className="text-xl">
              Add new member to {realmInfo?.displayName}
            </h2>
          </div>

          <Input
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName={`${close ? 'mt-0 mb-6' : 'my-6'}`}
            label="Member's wallet"
            placeholder="Member's wallet"
            value={form.destinationAccount}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'destinationAccount',
              })
            }
            noMaxWidth
            error={formErrors['destinationAccount']}
          />

          <div
            className="flex items-center hover:cursor-pointer w-24 my-3"
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? (
              <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
            ) : (
              <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
            )}
            <small className="text-fgd-3">Options</small>
          </div>

          {showOptions && (
            <>
              <Input
                noMaxWidth
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                wrapperClassName="mb-6"
                label="Title of your proposal"
                placeholder="Title of your proposal"
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
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                wrapperClassName="mb-6"
                min={mintMinAmount}
                label="Voter weight"
                value={form.amount}
                type="number"
                onChange={setAmount}
                step={mintMinAmount}
                error={formErrors['amount']}
                onBlur={validateAmountOnBlur}
              />

              {canChooseWhoVote && (
                <VoteBySwitch
                  disabled={!canChooseWhoVote}
                  checked={voteByCouncil}
                  onChange={() => {
                    setVoteByCouncil(!voteByCouncil)
                  }}
                />
              )}

              <Input
                noMaxWidth
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
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
            </>
          )}

          <div
            className={`${
              close ? 'justify-start' : 'justify-center'
            } flex gap-x-6 items-center mt-8`}
          >
            <SecondaryButton
              disabled={isLoading}
              className="w-44"
              onClick={() => close()}
            >
              Cancel
            </SecondaryButton>

            <Button
              disabled={!form.destinationAccount || isLoading}
              className="w-44 flex justify-center items-center"
              onClick={confirmPropose}
            >
              Add member
            </Button>
          </div>
        </>
      ) : (
        <div className="w-full flex lg:flex-row flex-col justify-between items-start">
          <div className="w-full flex lg:mb-0 mb-20 flex-col gap-y-5 justify-start items-start lg:max-w-xl rounded-xl">
            <Input
              useDefaultStyle={false}
              className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
              wrapperClassName="mb-6 w-full"
              label="Member's wallet"
              placeholder="Member's wallet"
              value={form.destinationAccount}
              type="text"
              onChange={(event) =>
                handleSetForm({
                  value: event.target.value,
                  propertyName: 'destinationAccount',
                })
              }
              noMaxWidth
              error={formErrors['destinationAccount']}
            />

            <Input
              noMaxWidth
              useDefaultStyle={false}
              className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
              wrapperClassName="mb-6 w-full lg:w-1/2"
              min={mintMinAmount}
              label="Voter weight"
              value={form.amount}
              type="number"
              onChange={setAmount}
              step={mintMinAmount}
              error={formErrors['amount']}
              onBlur={validateAmountOnBlur}
            />

            <VoteBySwitch
              disabled={!canChooseWhoVote}
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />

            <Button
              disabled={
                !form.destinationAccount ||
                isLoading ||
                formErrors['destinationAccount']
              }
              className="w-44 flex justify-center items-center mt-8"
              onClick={confirmPropose}
            >
              Add member
            </Button>
          </div>

          <div className="lg:max-w-xs max-w-xl w-full">
            <Input
              noMaxWidth
              useDefaultStyle
              wrapperClassName="mb-6"
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
              wrapperClassName="mb-20"
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

            <TokenBalanceCard />
          </div>
        </div>
      )}
    </>
  )
}

export default AddMemberForm
