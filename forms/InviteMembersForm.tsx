import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import useWalletStore from 'stores/useWalletStore'
import { notify } from '@utils/notifications'

import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Input from '../components_2/Input'
import Button from '../components_2/ProductButtons'
import Text from '../components_2/ProductText'

import { updateUserInput, validateSolAddress } from '../utils/formValidation'

function InviteAddress({
  address = '',
  currentUser = false,
  index,
  onRemoveClick,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center truncate">
        <div
          className={`flex rounded-full ${
            currentUser ? 'white-fill text-black' : 'black-fill'
          } border-gradient border-1`}
        >
          <div className="flex items-center justify-center w-10 h-10 ">
            {currentUser ? 'Me' : index}
          </div>
        </div>
        <div className="w-full pr-4 ml-4 truncate input-base">{address}</div>
      </div>
      <div
        className="p-3 hover:cursor-pointer text-white/50 hover:text-white active:text-white/70 focus:text-white focus:border focus:border-white disabled:text-white/10"
        onClick={onRemoveClick}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 1L1 13M13 13L1 1"
            stroke="currentColor"
            strokeOpacity="1"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  )
}

export const InviteMembersSchema = {
  memberAddresses: yup
    .array()
    .of(yup.string())
    .when('$addCouncil', (addCouncil, schema) => {
      if (typeof addCouncil === 'undefined') {
        return schema.min(1, 'A DAO needs at least one member')
      } else {
        return addCouncil
          ? schema.min(1, 'A DAO needs at least one member')
          : schema
      }
    }),
}

export interface InviteMembers {
  memberAddresses: string[]
}

export default function InviteMembersForm({
  formData,
  onSubmit,
  onPrevClick,
  currentStep,
  totalSteps,
}) {
  const { current } = useWalletStore((s) => s)
  const inputElement = useRef<HTMLInputElement>(null)
  const [pasteBuffer, setPasteBuffer] = useState<string[]>([])
  const [inviteList, setInviteList] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string>('')

  const schema = yup.object(InviteMembersSchema)
  const {
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    context: formData,
  })
  const userAddress = current?.publicKey?.toBase58() || ''
  const isUserDAOMember = userAddress && inviteList.indexOf(userAddress) > -1

  useEffect(() => {
    if (typeof formData.addCouncil === 'undefined' || formData?.addCouncil) {
      updateUserInput(formData, InviteMembersSchema, setValue)
      setInviteList(
        formData.memberAddresses?.filter((wallet) => {
          return validateSolAddress(wallet)
        }) || []
      )
    } else {
      // go to next step:
      serializeValues({ memberAddresses: null })
    }
  }, [formData])

  useEffect(() => {
    setValue('memberAddresses', inviteList, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [inviteList])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  function handlePaste(ev) {
    setValidationError('')
    const validPastedAddrsses = validateInput(ev.clipboardData.getData('text'))
    if (validPastedAddrsses.length === 0) {
      return setValidationError('Invalid wallet address')
    } else {
      ev.preventDefault()
    }
    const updatedPasteBuffer = new Set([...pasteBuffer, ...validPastedAddrsses])
    setPasteBuffer([...updatedPasteBuffer])
  }

  function handleKeyDown(ev) {
    setValidationError('')
    if (ev.defaultPrevented) {
      return // Do nothing if the event was already processed
    }

    if (ev.key === 'Enter') {
      addAddressesToInviteList()
      ev.preventDefault()
    }
  }

  function validateInput(input: string) {
    const addressList = input.split(/[\s|,]/).filter((item) => item.length > 2)
    return [...new Set(addressList)].filter((wallet) => {
      return validateSolAddress(wallet)
    })
  }

  function addAddressesToInviteList() {
    setValidationError('')

    const validatedAddress = validateInput(inputElement?.current?.value || '')
    if (pasteBuffer.length === 0 && validatedAddress.length === 0) {
      return setValidationError('Invalid wallet address')
    }

    const fullAddressSet = new Set([
      ...inviteList,
      ...pasteBuffer,
      ...validatedAddress,
    ])
    setPasteBuffer([])
    setInviteList([...fullAddressSet])
    const additionalCount = [...fullAddressSet].length

    if (inputElement?.current?.value) {
      inputElement.current.value = ''
    }
    return notify({
      type: 'success',
      message: `Added ${additionalCount} ${
        additionalCount === 0 || additionalCount > 1 ? 'Addresses' : 'Address'
      }`,
    })
  }

  function removeAddressFromPasteBuffer(address) {
    const newList = pasteBuffer.slice()
    const index = pasteBuffer.indexOf(address)
    if (index > -1) {
      newList.splice(index, 1)
      setPasteBuffer(newList)
    }
  }

  function removeAddressFromInviteList(address) {
    const newList = inviteList.slice()
    const index = inviteList.indexOf(address)
    if (index > -1) {
      newList.splice(index, 1)
      setInviteList(newList)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="invite-members-form"
    >
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="Invite members"
        title="Next, invite members with their Solana Wallet Address."
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <FormField
          title="Invite members"
          description="Add Solana wallet addressses, separated by a comma or line-break."
        >
          {pasteBuffer.length > 0 && (
            <div className="py-5 space-y-5">
              {pasteBuffer.map((address, index) => (
                <InviteAddress
                  key={address}
                  address={address}
                  index={index + 1}
                  onRemoveClick={() => removeAddressFromPasteBuffer(address)}
                />
              ))}
            </div>
          )}
          <Input
            type="text"
            name="memberAddresses"
            placeholder="e.g. CWvWQWt5mTv7Zx..."
            data-testid="dao-member-list-input"
            ref={inputElement}
            error={errors.daoName?.message || validationError}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            defaultValue={userAddress}
          />
          <div className="text-right">
            <Button type="button" onClick={() => addAddressesToInviteList()}>
              + Invite
            </Button>
          </div>
        </FormField>
      </div>

      <div className="flex flex-col mt-10">
        <Text level="1">
          {inviteList.length}{' '}
          {inviteList.length === 0 || inviteList.length > 1
            ? 'Addresses'
            : 'Address'}
        </Text>
        <Text level="2" className="text-white/50">
          Users must connect their wallet to Realms to become DAO members
        </Text>
        {isUserDAOMember && (
          <div className="flex flex-col mt-8">
            <InviteAddress
              address={userAddress}
              currentUser
              index={0}
              onRemoveClick={() => removeAddressFromInviteList(userAddress)}
            />
          </div>
        )}
        {inviteList.length > 0 ? (
          inviteList
            .filter((address) => address != userAddress)
            .map((address, index) => {
              return (
                <div key={address} className="mt-8">
                  <InviteAddress
                    address={address}
                    index={index + 1}
                    onRemoveClick={() => removeAddressFromInviteList(address)}
                  />
                </div>
              )
            })
        ) : (
          <div className="flex flex-col px-8 py-8 mt-4 rounded bg-night-grey">
            <div className="text-5xl text-center">📭</div>
            <Text className="text-center">
              You have not added any addresses yet...
            </Text>
          </div>
        )}
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle=""
      />
    </form>
  )
}
