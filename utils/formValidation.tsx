import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { SanitizedObject } from './helpers'

export interface formValidation {
  isValid: boolean
  validationErrors: any
}

export const isFormValid = async (schema, formValues, abortEarly = false) => {
  if (!schema) {
    throw 'please provide schema'
  }

  const values = new SanitizedObject({
    isValid: false,
    validationErrors: new SanitizedObject({}),
  }) as formValidation

  try {
    await schema.validate(formValues, { abortEarly })
    values.isValid = true
  } catch (err) {
    console.log('Validation Error', err)

    values.isValid = false
    const fieldName = err.path
    if (
      abortEarly &&
      Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
    ) {
      values.validationErrors[fieldName] = err.errors
    } else {
      err.inner?.forEach((error) => {
        const fieldName = error.path
        if (
          error.path &&
          Object.prototype.hasOwnProperty.call(schema.fields, fieldName)
        ) {
          values.validationErrors[fieldName] = error.message
        }
      })
    }
  }
  return values
}

export function validatePubkey(address: string) {
  try {
    new PublicKey(address)
    return true
  } catch (err) {
    return false
  }
}

export function validateSolAddress(address: string) {
  try {
    const pubkey = new PublicKey(address)
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}
export function updateUserInput(formData, schema, setValue) {
  Object.keys(schema).forEach((fieldName) => {
    if (formData) {
      const value = formData[fieldName]
      if (typeof value !== 'undefined') {
        setValue(fieldName, value, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  })
}

export function isWizardValid({ currentStep, steps, formData }) {
  if (currentStep > 0 && currentStep <= steps.length + 1) {
    const schema = steps
      .slice(0, currentStep)
      .map(({ schema }) => schema)
      .reduce((prev, curr) => {
        return {
          ...prev,
          ...curr,
        }
      }, {})
    try {
      yup.object(schema).validateSync(formData, { context: formData })
      return true
    } catch (error) {
      console.log(
        'form validation error',
        error.message,
        error.values,
        JSON.stringify('error')
      )
      return false
    }
  }
  return true
}
