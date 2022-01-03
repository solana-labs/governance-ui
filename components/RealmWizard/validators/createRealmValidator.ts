import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'

const publicKeyValidationTest = (value: string) => {
  try {
    if (!value) return false
    new PublicKey(value)
    return true
  } catch (e) {
    return false
  }
}

const CreateFormSchema = yup.object().shape({
  governanceProgramId: yup
    .string()
    .required('Governance program id is required')
    .test(
      'is-public-key',
      'Governance program id is not a valid public key',
      publicKeyValidationTest
    ),
  name: yup.string().required('Name is required'),
  communityMintId: yup
    .string()
    .test(
      'is-public-key',
      'Community token mint id is not a valid public key',
      (value) => (value ? publicKeyValidationTest(value) : true)
    ),
  // communityMint: yup.object().required('Community token mint is not valid'),
  councilMintId: yup
    .string()
    .test(
      'is-public-key',
      'Council token mint id is not a valid public key',
      (value) => (value ? publicKeyValidationTest(value) : true)
    ),
  councilMint: yup.object().when('councilMintId', {
    is: (value) => value,
    then: yup.object().required('Council token mint is not valid'),
  }),
})

export { CreateFormSchema, publicKeyValidationTest }
