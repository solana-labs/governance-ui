/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { isFormValid } from '@utils/formValidation'
import {
  DepositReserveLiquidityAndObligationCollateralForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { handleEverlendWithdraw } from 'Strategies/protocols/everlend/depositTools'
import { getEverlendStrategies } from 'Strategies/protocols/everlend/tools'
import {
  CONFIG_DEVNET,
  CONFIG_MAINNET,
  REGISTRY_DEV,
  REGISTRY_MAIN,
  REWARD_PROGRAM_ID,
} from 'Strategies/protocols/everlend/constants'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const WithdrawForm = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const { realmInfo } = useRealm()
  const [stratagies, setStratagies] = useState<any>([])

  const { assetAccounts } = useGovernanceAssets()

  useEffect(() => {
    const fetchStratagies = async () => {
      const fetchedStratagies = await getEverlendStrategies(connection)
      setStratagies(fetchedStratagies)
    }

    fetchStratagies()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [
    form,
    setForm,
  ] = useState<DepositReserveLiquidityAndObligationCollateralForm>({
    uiAmount: '0',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    const isSol = form.governedAccount.isSol
    const owner = isSol
      ? form.governedAccount.pubkey
      : form.governedAccount.extensions!.token!.account.owner

    const isDev = connection.cluster === 'devnet'

    const REGISTRY = new PublicKey(isDev ? REGISTRY_DEV : REGISTRY_MAIN)
    const CONFIG = new PublicKey(isDev ? CONFIG_DEVNET : CONFIG_MAINNET)

    const matchedStratagie = stratagies.find(
      (el) =>
        el.handledMint ===
        form.governedAccount?.extensions.mint?.publicKey.toString()
    )

    const [rewardPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('reward_pool'),
        CONFIG.toBuffer(),
        new PublicKey(matchedStratagie.handledMint).toBuffer(),
      ],
      REWARD_PROGRAM_ID
    )
    const [rewardAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('mining'), owner.toBuffer(), rewardPool.toBuffer()],
      REWARD_PROGRAM_ID
    )

    const liquidityATA = isSol
      ? await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(matchedStratagie.handledMint),
          owner,
          true
        )
      : form.governedAccount.extensions!.token!.account.address

    const ctokenATA = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(matchedStratagie.poolMint),
      owner,
      true
    )

    const amountToRate = Number(
      (Number(form.uiAmount) * matchedStratagie.rateEToken).toFixed(
        matchedStratagie.decimals
      )
    )

    const { withdrawTx: tx } = await handleEverlendWithdraw(
      Boolean(isSol),
      connection,
      owner,
      REGISTRY,
      CONFIG,
      rewardPool,
      rewardAccount,
      matchedStratagie.poolPubKey,
      getMintNaturalAmountFromDecimalAsBN(
        amountToRate,
        form.governedAccount.extensions.mint!.account.decimals
      ),
      ctokenATA,
      liquidityATA
    )

    return {
      serializedInstruction: serializeInstructionToBase64(
        tx.instructions[tx.instructions.length - 1]
      ),
      isValid: true,
      governance: form.governedAccount.governance,
      shouldSplitIntoSeparateTxs: true,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Wallet"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Input
        label="Amount to withdraw"
        value={form.uiAmount}
        type="string"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />
    </>
  )
}

export default WithdrawForm
