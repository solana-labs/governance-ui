import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormHeader from '../FormHeader'
import FormField from '../FormField'
import FormFooter from '../FormFooter'
import Input from '../Input'
import Button from 'components_2/Button'

import { PublicKey } from '@solana/web3.js'

function validateSolAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}

export default function Step2({ onSubmit, onPrevClick }) {
  const inputElement = useRef<HTMLInputElement>(null)
  const { query } = useRouter()
  const [memberList, setMemberList] = useState<string[]>([])
  const schemaObject = {
    daoMembers: yup.array().of(yup.string()).required('Required'),
  }
  const schema = yup.object(schemaObject).required()
  const {
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (query?.step2 && !Array.isArray(query.step2)) {
      const formData = JSON.parse(query.step2)
      Object.keys(schemaObject).forEach((fieldName) => {
        const value = formData[fieldName]
        setValue(fieldName, value, {
          shouldValidate: true,
          shouldDirty: true,
        })
      })
    }
  }, [query])

  function serializeValues(values) {
    onSubmit({ step: 2, data: values })
  }

  // function handlePaste(ev) {
  // parseAddressList(ev.clipboardData.getData('text'))
  // ev.preventDefault();
  // }

  function handleKeyDown(ev) {
    if (ev.defaultPrevented) {
      return // Do nothing if the event was already processed
    }
    console.log('keypress')
    if (ev.key === 'Enter') {
      parseAddressList()
      ev.preventDefault()
    }
  }

  function parseAddressList(input = '') {
    const inputString = input || inputElement?.current?.value
    if (inputString) {
      const addressList = inputString
        .split(/[\s|,]/)
        .filter((item) => item.length > 2)
      const validatedAddressList = [...new Set(addressList)].filter(
        (wallet) => {
          return validateSolAddress(wallet)
        }
      )

      const fullAddressSet = new Set([...memberList, ...validatedAddressList])
      setMemberList([...fullAddressSet])
      console.log('parse lists', [...fullAddressSet])

      if (inputElement?.current?.value) {
        inputElement.current.value = ''
      }
    }
  }

  function removeAddress(address) {
    const newList = memberList.slice()
    const index = memberList.indexOf(address)
    if (index > -1) {
      newList.splice(index, 1)
      setMemberList(newList)
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
          {memberList.length > 0 && (
            <div className="py-5 space-y-5">
              {memberList.map((address, index) => (
                <div
                  key={index}
                  className="flex items-baseline justify-between"
                >
                  <div className="text-2xl">{address}</div>
                  <div
                    className="cursor-pointer"
                    onClick={() => removeAddress(address)}
                  >
                    <img src="/1-Landing-v2/icon-x.svg" alt="icon" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Input
            type="text"
            name="daoMembers"
            placeholder="e.g. CWvWQWt5mTv7Zx..."
            data-testid="dao-member-list-input"
            ref={inputElement}
            error={errors.daoName?.message || ''}
            // onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />
          <div className="pt-8">
            <Button type="button" inverse onClick={() => parseAddressList}>
              <div className="px-12">Add</div>
            </Button>
          </div>
        </FormField>
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(2)}
        faqTitle="About Multisig Membership"
      />
    </form>
  )
}
