import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { ConditionBuilder } from 'yup/lib/Condition'
import clsx from 'clsx'

import useWalletStore from 'stores/useWalletStore'
import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import Input from '@components/NewRealmWizard/components/Input'

import { updateUserInput, validateSolAddress } from '@utils/formValidation'
import { FORM_NAME as MULTISIG_FORM } from 'pages/realms/new/multisig'
import { textToAddressList } from '@utils/textToAddressList'

/**
 * Convert a list of addresses into a list of uniques and duplicates
 */
const splitUniques = (addresses: string[]) => {
  const unique = new Set<string>()
  const duplicate: string[] = []

  addresses.forEach((address) => {
    if (unique.has(address)) {
      duplicate.push(address)
    } else {
      unique.add(address)
    }
  })

  return { duplicate, unique: Array.from(unique.values()) }
}

function InviteAddress({
  address = '',
  currentUser = false,
  index,
  invalid = false,
  onRemoveClick,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center truncate">
        {invalid ? (
          <svg
            className="h-11 w-11 shrink-0"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="15.5" fill="#201F27" stroke="#FF7C7C" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20.5857 21.2889C19.3574 22.3549 17.754 23 16 23C12.134 23 9 19.866 9 16C9 14.246 9.64514 12.6426 10.7111 11.4143L20.5857 21.2889ZM21.2926 20.5815L11.4185 10.7075C12.6463 9.64368 14.248 9 16 9C19.866 9 23 12.134 23 16C23 17.752 22.3563 19.3537 21.2926 20.5815ZM24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16Z"
              fill="#FF7C7C"
            />
          </svg>
        ) : (
          <div className={`flex rounded-full border-gradient transparent-fill`}>
            <div className="flex items-center justify-center w-10 h-10 ">
              {currentUser ? 'Me' : index}
            </div>
          </div>
        )}
        <div
          className={clsx(
            'w-full',
            'pr-4',
            'ml-4',
            'truncate',
            'input-base',
            invalid && 'text-error-red'
          )}
        >
          {address}
        </div>
      </div>
      <button
        type="button"
        className="p-3 hover:cursor-pointer disabled:cursor-not-allowed text-fgd-2 hover:text-fgd-1 active:text-fgd-1 focus:text-white disabled:text-fgd-3"
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
      </button>
    </div>
  )
}

export const InviteMembersSchema = {
  memberAddresses: yup
    .array()
    .of(yup.string())
    .when(['$addCouncil', '$useExistingCouncilToken'], ((
      addCouncil,
      useExistingCouncilToken,
      schema
    ) => {
      if (useExistingCouncilToken) {
        return schema.min(0).required('Required')
      } else if (typeof addCouncil === 'undefined') {
        return schema
          .min(1, 'A DAO needs at least one member')
          .required('Required')
      } else {
        return addCouncil
          ? schema
              .min(1, 'A DAO needs at least one member')
              .required('Required')
          : schema
      }
    }) as ConditionBuilder<any>),
}

export interface InviteMembers {
  memberAddresses: string[]
}

export default function InviteMembersForm({
  visible,
  type,
  formData,
  onSubmit,
  onPrevClick,
  currentStep,
  totalSteps,
}) {
  const { current } = useWalletStore((s) => s)
  const userAddress = current?.publicKey?.toBase58()
  const inputElement = useRef<HTMLInputElement>(null)
  const [inviteList, setInviteList] = useState<string[]>([])
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([])
  const [lacksMintAuthority, setLackMintAuthority] = useState(false)

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

  useEffect(() => {
    if (typeof formData.addCouncil === 'undefined' || formData?.addCouncil) {
      updateUserInput(formData, InviteMembersSchema, setValue)
      if (
        formData.useExistingCouncilToken &&
        formData.councilTokenInfo?.mint?.mintAuthority?.toBase58() !==
          userAddress
      ) {
        setLackMintAuthority(true)
        setInviteList([])
        setInvalidAddresses([])
      } else {
        setLackMintAuthority(false)
        setInviteList(
          (current) =>
            formData.memberAddresses?.filter((wallet) => {
              return validateSolAddress(wallet)
            }) || current
        )
      }
    } else if (visible) {
      // go to next step:
      serializeValues({ memberAddresses: null })
    }
  }, [formData])

  useEffect(() => {
    setValue('memberAddresses', splitUniques(inviteList).unique, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [inviteList])

  // The user can get to this screen without connecting their wallet. If they
  // connect their wallet after being in a disconnected state, we want to
  // populate the invite list with their wallet address.
  useEffect(() => {
    if (
      userAddress &&
      !inviteList.includes(userAddress) &&
      !lacksMintAuthority
    ) {
      setInviteList((currentList) => currentList.concat(userAddress))
    }
  }, [userAddress])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  function addToAddressList(textBlock: string) {
    if (lacksMintAuthority) {
      return
    }

    const { valid, invalid } = textToAddressList(textBlock)
    const { unique, duplicate } = splitUniques(inviteList.concat(valid))
    setInviteList(unique)
    setInvalidAddresses((currentList) =>
      currentList.concat(invalid).concat(duplicate)
    )
  }

  function handleBlur(ev) {
    addToAddressList(ev.currentTarget.value)
    ev.currentTarget.value = ''
  }

  function handlePaste(ev: React.ClipboardEvent<HTMLInputElement>) {
    addToAddressList(ev.clipboardData.getData('text'))
    ev.clipboardData.clearData()
    // Don't allow the paste event to populate the input field
    ev.preventDefault()
  }

  function handleKeyDown(ev) {
    if (ev.defaultPrevented) {
      return // Do nothing if the event was already processed
    }

    if (ev.key === 'Enter') {
      addToAddressList(ev.currentTarget.value)
      ev.currentTarget.value = ''
      ev.preventDefault()
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

  function removeAddressFromInvalidList(address) {
    const newList = invalidAddresses.slice()
    const index = invalidAddresses.indexOf(address)
    if (index > -1) {
      newList.splice(index, 1)
      setInvalidAddresses(newList)
    }
  }

  const error =
    errors.daoName?.message ||
    (invalidAddresses.length > 0
      ? 'Invalid and duplicate addresses will not be included'
      : '')

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="invite-members-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={`Next, invite${
          type === MULTISIG_FORM ? ' ' : ' council '
        }members with their Solana Wallet Address.`}
      />
      <div className="mt-24 space-y-10 md:space-y-12">
        <FormField
          description="Add Solana wallet addressses, separated by a comma or line-break."
          disabled={lacksMintAuthority}
          title="Invite members"
          titleExtra={
            !!inviteList.length && (
              <div className="text-[18px] text-bkg-1 leading-[25px] px-2 bg-fgd-1 rounded">
                {inviteList.length}
              </div>
            )
          }
        >
          {(inviteList.length > 0 || invalidAddresses.length > 0) && (
            <div className="py-5 space-y-5">
              {inviteList.map((address, index) => (
                <InviteAddress
                  key={address}
                  address={address}
                  currentUser={address === userAddress}
                  index={index + 1}
                  onRemoveClick={() => removeAddressFromInviteList(address)}
                />
              ))}
              {invalidAddresses.map((address, index) => (
                <InviteAddress
                  invalid
                  key={address + index}
                  address={address}
                  index={index + 1}
                  onRemoveClick={() => removeAddressFromInvalidList(address)}
                />
              ))}
            </div>
          )}
          <Input
            type="text"
            name="memberAddresses"
            placeholder="e.g. CWvWQWt5mTv7Zx..."
            data-testid="dao-member-list-input"
            disabled={lacksMintAuthority}
            ref={inputElement}
            error={error.toString() || ''}
            warning={
              lacksMintAuthority
                ? 'You do not own the mint authority for this token, therefore you cannot invite members to your DAO. Anyone who owns the token is able to join your DAO as a council member.'
                : undefined
            }
            onBlur={handleBlur}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />
        </FormField>
      </div>
      <FormFooter
        isValid={isValid || lacksMintAuthority}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
