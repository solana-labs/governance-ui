import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'

import useWalletStore from 'stores/useWalletStore'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input from '../Input'
import Button from 'components_2/Button'

import {
  STEP1_SCHEMA,
  STEP2_SCHEMA,
  getFormData,
  updateUserInput,
} from './Wizard'

function validateSolAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}

function InviteAddress({
  address = '',
  currentUser = false,
  index,
  onRemoveClick,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`flex justify-center items-center rounded-full h-10 w-10 ${
            currentUser ? 'white-fill text-black' : 'black-fill'
          } border-gradient`}
        >
          {currentUser ? 'Me' : index}
        </div>
        <div className="ml-4 text-2xl">{address}</div>
      </div>
      <div className="cursor-pointer" onClick={onRemoveClick}>
        <img src="/1-Landing-v2/icon-x.svg" alt="icon" />
      </div>
    </div>
  )
}

export default function Step2({ onSubmit, onPrevClick }) {
  const { current } = useWalletStore((s) => s)
  const inputElement = useRef<HTMLInputElement>(null)
  const [pasteBuffer, setPasteBuffer] = useState<string[]>([])
  const [inviteList, setInviteList] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string>('')

  const schema = yup.object(STEP2_SCHEMA).required()
  const {
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const userAddress = current?.publicKey?.toBase58() || ''
  const isUserDAOMember = userAddress && inviteList.indexOf(userAddress) > -1

  useEffect(() => {
    const formData = getFormData()
    yup
      .object(STEP1_SCHEMA)
      .isValid(formData)
      .then((valid) => {
        if (valid) {
          updateUserInput(STEP2_SCHEMA, setValue)
          setInviteList(
            formData.memberAddresses?.filter((wallet) => {
              return validateSolAddress(wallet)
            }) || []
          )
        } else {
          onPrevClick(2)
        }
      })
  }, [])

  useEffect(() => {
    setValue('memberAddresses', inviteList, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [inviteList])

  function serializeValues(values) {
    onSubmit({ step: 2, data: values })
  }

  function handlePaste(ev) {
    setValidationError('')
    const validPastedAddrsses = validateInput(ev.clipboardData.getData('text'))
    if (validPastedAddrsses.length === 0) {
      return setValidationError('Invalid wallet address')
    } else {
      ev.preventDefault()
    }
    const fullAddressSet = new Set([...inviteList, ...validPastedAddrsses])
    setInviteList([...fullAddressSet])
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
    const inputString = inputElement?.current?.value
    if (inputString) {
      const validatedAddress = validateInput(inputString)
      if (validatedAddress.length === 0) {
        return setValidationError('Invalid wallet address')
      }
      const fullAddressSet = new Set([
        ...inviteList,
        ...pasteBuffer,
        ...validatedAddress,
      ])
      setPasteBuffer([])
      setInviteList([...fullAddressSet])

      if (inputElement?.current?.value) {
        inputElement.current.value = ''
      }
    }
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
      data-testid="multisig-step-2"
    >
      <FormHeader
        currentStep={2}
        totalSteps={4}
        stepDescription="Invite members"
        title="Next, invite members with their Solana Wallet Address."
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <FormField
          title="Invite members"
          description="Add Solana wallet addressses, separated by a comma or line-break."
        >
          {pasteBuffer.length > 0 && (
            <div className="py-5 space-y-5">
              {pasteBuffer.map((address, index) => (
                <div
                  key={index}
                  className="flex items-baseline justify-between"
                >
                  <div className="text-2xl">{address}</div>
                  <div
                    className="cursor-pointer"
                    onClick={() => removeAddressFromPasteBuffer(address)}
                  >
                    <img src="/1-Landing-v2/icon-x.svg" alt="icon" />
                  </div>
                </div>
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
          <div className="pt-8">
            <Button
              type="button"
              inverse
              onClick={() => addAddressesToInviteList()}
            >
              <div className="px-12">Add</div>
            </Button>
          </div>
        </FormField>
      </div>

      <div className="flex flex-col mt-16">
        <h3 className="text-xl font-light">
          {inviteList.length}{' '}
          {inviteList.length === 0 || inviteList.length > 1
            ? 'Addresses'
            : 'Address'}
        </h3>
        <div className="text-sm opacity-60">
          Once the process is complete, users must connect their wallet to
          Realms to become DAO members
        </div>
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
          <div className="bg-[#201f27] text-lg mt-3 rounded flex flex-col justify-center items-center text-center px-20 py-10">
            <div className="text-5xl">📭</div>
            <div>You have not added any addresses yet...</div>
          </div>
        )}
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(2)}
        faqTitle="About Multisig Membership"
      />
    </form>
  )
}
