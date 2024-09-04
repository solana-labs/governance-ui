import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryWithdrawForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import { BasketsSDK, FilterOption } from "@symmetry-hq/baskets-sdk";
import { sellBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";
import { useConnection } from '@solana/wallet-adapter-react';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import Select from '@components/inputs/Select';
import { PublicKey } from '@solana/web3.js';
import { LoaderIcon } from './SymmetryEditBasket';
import ArrowButton from './components/ArrowButton';

const SymmetryWithdraw = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets();
  const [basketsSdk, setBasketSdk] = useState<BasketsSDK|undefined>(undefined);
  const [form, setForm] = useState<SymmetryWithdrawForm>({
    governedAccount: undefined,
    basketAddress: undefined,
    withdrawAmount: 0,
    withdrawType: 3
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext);
  const [managedBaskets, setManagedBaskets] = useState<any>(undefined);
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [assetAccountsLoaded, setAssetAccountsLoaded] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<any>(undefined);

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handleSelectBasket = (basket: any) => {
    handleSetForm({ propertyName: 'basketAddress', value: basket.basket.ownAddress })
  }

  useEffect(() => {
    if(assetAccounts && assetAccounts.length > 0 && !assetAccountsLoaded)
      setAssetAccountsLoaded(true);
  }, [assetAccounts]);

  useEffect(() => {
    if(form.governedAccount) {
      const basketsOwnerAccounts: FilterOption[] = [{
        filterType: 'manager',
        filterPubkey: form.governedAccount.pubkey
      }]
      BasketsSDK.init(connection).then((sdk) => {
        setBasketSdk(sdk);
        sdk.findBaskets(basketsOwnerAccounts).then((baskets) => {
          sdk.getCurrentCompositions(baskets).then((compositions) => {
            const basketAccounts:any[] = [];
            baskets.map((basket, i) => {

              basketAccounts.push({
                governedAccount: assetAccounts.filter(x => x.pubkey.toBase58() === basket.data.manager.toBase58())[0],
                basket: basket,
                composition: compositions[i]
              });
            });
            setManagedBaskets(basketAccounts);
          });
        });
      });
    }
  }, [form.governedAccount]);

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const ix = await sellBasketIx(
      connection, 
      //@ts-ignore
      form.governedAccount?.governance.nativeTreasuryAddress,
      form.basketAddress,
      Number(form.withdrawAmount),
      form.withdrawType
    )
    
    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount?.governance
    };
  }
  
  return <>
    {
      assetAccountsLoaded ?
      <GovernedAccountSelect
        label="Select DAO Account that manages the Basket"
        governedAccounts={assetAccounts.filter(x => x.isSol)}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type='wallet'
      />
      :
      <div className='flex items-center gap-2 p-2 px-3 rounded-full bg-lime-700 max-w-fit'>
        <LoaderIcon/>
        <p className='text-sm font-bold'>Loading DAO Accounts</p>
      </div>
    }
    {
      form.governedAccount &&
      (managedBaskets ?
      <Select
        label='Select Basket'
        subtitle='Select a basket managed by the DAO'
        value={form.basketAddress?.toBase58()}
        placeholder="Select Basket"
        onChange={(e) => {
          handleSetForm({ propertyName: 'basketAddress', value: new PublicKey(e) })
        }}
      >
        {
          managedBaskets.map((basket, i) => {
            return <Select.Option key={i} value={basket.basket.ownAddress.toBase58()}>
              {
                basket.composition.name + " (" + basket.composition.symbol + ") : " + basket.basket.ownAddress.toBase58()
              }
            </Select.Option>
          })
        }
      </Select>
      :
      <div className='flex items-center gap-2 p-2 px-3 rounded-full bg-blue-700 max-w-fit'>
        <LoaderIcon/>
        <p className='text-sm font-bold'>Loading Baskets Managed by the Account</p>
      </div>
      )
    }
    {
      form.basketAddress &&
      <div className='flex flex-col gap-2'>
        <a className='max-w-fit' href={`https://app.symmetry.fi/view/${form.basketAddress.toBase58()}`} target='_blank' rel='noreferrer'>
          <ArrowButton title='View Basket on Symmetry'/>
        </a>
      </div>
    }
    {
      form.basketAddress && 
      <GovernedAccountSelect
      label="Token to Withdraw"
      governedAccounts={assetAccounts.filter(x => x.isToken).filter(x => x.extensions.mint?.publicKey.toBase58() === selectedBasket?.composition?.basketTokenMint)}
      onChange={(value) => {
        handleSetForm({ value, propertyName: 'governedAccount' })
      }}
      value={form.governedAccount}
      error={formErrors['governedAccount']}
      shouldBeGoverned={shouldBeGoverned}
      governance={governance}
      type='token'
    />
    }

    {
      form.basketAddress && form.governedAccount &&
      <>
        <Input
          subtitle={"Select amount of basket tokens you'd like to withdraw with."}
          label="Withdraw Amount"
          value={form.withdrawAmount}
          type="number"
          onChange={(e) => handleSetForm({ propertyName: 'withdrawAmount', value: e.target.value })}
          error={formErrors['withdrawAmount']}
        />
        <Select
          label='Withdrawal Type'
          subtitle='You can withdraw basket tokens directly, or rebalance them and receive USDC'
          value={form.withdrawType}
          placeholder="Withdrawal Type"
          onChange={(e) => {
            handleSetForm({ propertyName: 'withdrawType', value: e })
          }}
          componentLabel={
            form.withdrawType === 2 ? 'Rebalance & Receive USDC' : 'Withdraw Basket Composition'
          }
        >
          <Select.Option key={0} value={2}>
            Rebalance & Receive USDC
          </Select.Option>
          <Select.Option key={1} value={3}>
            Withdraw Basket Composition
          </Select.Option>
        </Select>
      </>
    }
    {
        form.governedAccount &&
          <div className='w-full flex items-center gap-2 p-4 border text-yellow-500 border-yellow-500 rounded-md'>
            <svg
            className='flex flex-shrink-0'
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className='text-xs text-yellow-500'>
              Make sure {form.governedAccount?.pubkey.toBase58()} has at least 0.08 SOL, which is required for a temporary withdrawal account, which will automatically be closed after completion & SOL will be refunded.
            </p>
          </div>
      }
  </>
}

export default SymmetryWithdraw;