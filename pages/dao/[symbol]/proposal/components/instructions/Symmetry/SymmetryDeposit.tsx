import { ProgramAccount, Governance, serializeInstructionToBase64 } from '@solana/spl-governance'
import { SymmetryDepositForm, UiInstruction } from '@utils/uiTypes/proposalCreationTypes';
import { useContext, useEffect, useState } from 'react';
import Input from '@components/inputs/Input'
import { NewProposalContext } from '../../../new';
import { BasketsSDK, FilterOption } from "@symmetry-hq/baskets-sdk";
import { buyBasketIx } from "@symmetry-hq/baskets-sdk/dist/basketInstructions";
import ArrowButton from './components/ArrowButton';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import Select from '@components/inputs/Select';
import GovernedAccountSelect from '../../GovernedAccountSelect';
import { LoaderIcon } from './SymmetryEditBasket';

const SymmetryDeposit = ({ 
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance>
}) => {
  const {connection} = useConnection();
  const { assetAccounts } = useGovernanceAssets();
  const [basketsSdk, setBasketSdk] = useState<BasketsSDK|undefined>(undefined);
  const [form, setForm] = useState<SymmetryDepositForm>({
    governedAccount: undefined,
    basketAddress: undefined,
    depositToken: undefined,
    depositAmount: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext);
  const [managedBaskets, setManagedBaskets] = useState<any>(undefined);
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [assetAccountsLoaded, setAssetAccountsLoaded] = useState(false);

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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
        }
      ]
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
    const ix = await buyBasketIx(
      connection, 
      //@ts-ignore
      form.governedAccount?.governance.nativeTreasuryAddress,
      form.basketAddress,
      Number(form.depositAmount)
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
      form.governedAccount && form.basketAddress &&
      <>
        <GovernedAccountSelect
          label="USDC Account used for the Deposit"
          governedAccounts={assetAccounts.filter(x => x.extensions.mint?.publicKey.toBase58() === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')} /* Only allow USDC deposits for now */
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'governedAccount' })
          }}
          value={form.governedAccount}
          error={formErrors['governedAccount']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
          type='token'
        />

        <Input
          subtitle={"Amount of tokens will be deposited into the basket"}
          label="Deposit Amount"
          value={form.depositAmount}
          type="number"
          onChange={(e) => handleSetForm({ propertyName: 'depositAmount', value: e.target.value })}
          error={formErrors['depositAmount']}
        />
      </>
    }
  </>
}

export default SymmetryDeposit;