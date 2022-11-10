/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoMakeAddSpotMarketForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  Config,
  createAccountInstruction,
  getTokenBySymbol,
  I80F48,
  makeAddSpotMarketInstruction,
  MangoClient,
  NodeBankLayout,
  RootBankLayout,
} from '@blockworks-foundation/mango-client'
import * as common from '@project-serum/common'
import * as serum from '@project-serum/serum'
import { AccountType } from '@utils/uiTypes/assets'

const MakeAddSpotMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoMakeAddSpotMarketForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroup: undefined,
    oracleAccount: undefined,
    serumAccount: undefined,
    maintLeverage: 10,
    initLeverage: 5,
    liquidationFee: 0.05,
    optUtil: 0.7,
    optRate: 0.03,
    maxRate: 0.75,
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
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(new PublicKey(form.mangoGroup!))
      )!
      const quoteMint = getTokenBySymbol(groupConfig, groupConfig.quoteSymbol)

      const mangoGroup = await new MangoClient(
        connection,
        groupConfig.mangoProgramId
      ).getMangoGroup(groupConfig.publicKey)

      const provider = new common.Provider(
        connection,
        { ...wallet!, publicKey: wallet!.publicKey! },
        common.Provider.defaultOptions()
      )
      const oracle = new PublicKey(form.oracleAccount!)
      const market = new PublicKey(form.serumAccount!)
      const marketInfo = await serum.Market.load(
        connection,
        market,
        undefined,
        groupConfig.serumProgramId
      )

      if (!marketInfo.quoteMintAddress.equals(quoteMint.mintKey)) {
        throw new Error('invalid market')
      }

      const tx = new Transaction()
      const addToTx = async (
        instructions: Promise<TransactionInstruction[]>
      ) => {
        for (const ins of await instructions) {
          tx.add(ins)
        }
      }

      const baseVault = new Account()
      await addToTx(
        common.createTokenAccountInstrs(
          provider,
          baseVault.publicKey,
          marketInfo.baseMintAddress,
          mangoGroup.signerKey
        )
      )

      const nodeBank = await createAccountInstruction(
        connection,
        provider.wallet.publicKey,
        NodeBankLayout.span,
        groupConfig.mangoProgramId
      )
      tx.add(nodeBank.instruction)

      const rootBank = await createAccountInstruction(
        connection,
        provider.wallet.publicKey,
        RootBankLayout.span,
        groupConfig.mangoProgramId
      )
      tx.add(rootBank.instruction)

      tx.recentBlockhash = (
        await connection.getLatestBlockhash('max')
      ).blockhash

      const signers = [baseVault, nodeBank.account, rootBank.account]
      tx.setSigners(wallet!.publicKey!, ...signers.map((s) => s.publicKey))
      if (signers.length > 0) {
        tx.partialSign(...signers)
      }
      const signed = await wallet?.signTransaction(tx)
      const txid = await connection.sendRawTransaction(signed!.serialize())

      console.log('created accounts', txid)

      const instruction = makeAddSpotMarketInstruction(
        groupConfig.mangoProgramId,
        mangoGroup.publicKey,
        oracle,
        market,
        mangoGroup.dexProgramId,
        marketInfo.baseMintAddress,
        nodeBank.account.publicKey,
        baseVault.publicKey,
        rootBank.account.publicKey,
        form.governedAccount.governance.pubkey,
        I80F48.fromNumber(form.maintLeverage),
        I80F48.fromNumber(form.initLeverage),
        I80F48.fromNumber(form.liquidationFee),
        I80F48.fromNumber(form.optUtil),
        I80F48.fromNumber(form.optRate),
        I80F48.fromNumber(form.maxRate)
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Mango group"
        value={form.mangoGroup}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mangoGroup',
          })
        }
        error={formErrors['mangoGroup']}
      />

      <Input
        label="Oracle account"
        value={form.oracleAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'oracleAccount',
          })
        }
        error={formErrors['oracleAccount']}
      />

      <Input
        label="Serum account"
        value={form.serumAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'serumAccount',
          })
        }
        error={formErrors['serumAccount']}
      />
      <Input
        label="Maintenance leverage"
        value={form.maintLeverage}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maintLeverage',
          })
        }
        error={formErrors['maintLeverage']}
      />
      <Input
        label="Initial leverage"
        value={form.initLeverage}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'initLeverage',
          })
        }
        error={formErrors['initLeverage']}
      />
      <Input
        label="Liquidation fee"
        value={form.liquidationFee}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'liquidationFee',
          })
        }
        error={formErrors['liquidationFee']}
      />
      <Input
        label="Optimal utilization"
        value={form.optUtil}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'optUtil',
          })
        }
        error={formErrors['optUtil']}
      />

      <Input
        label="Optimal rate"
        value={form.optRate}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'optRate',
          })
        }
        error={formErrors['optRate']}
      />

      <Input
        label="Maximum rate"
        value={form.maxRate}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxRate',
          })
        }
        error={formErrors['maxRate']}
      />
    </>
  )
}

export default MakeAddSpotMarket
