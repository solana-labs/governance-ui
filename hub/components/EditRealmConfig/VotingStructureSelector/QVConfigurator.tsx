import { Coefficients } from '@solana/governance-program-library';
import { useConnection } from '@solana/wallet-adapter-react';
import React, { useState, useEffect } from 'react';

import { getCoefficients } from '../../../../actions/addPlugins/addQVPlugin';
import { useRealmQuery } from '@hooks/queries/realm';

import { Input } from '@hub/components/controls/Input';
import cx from '@hub/lib/cx';
import { preventNegativeNumberInput } from '@utils/helpers';

interface Props {
  className?: string;
  onCoefficientsChange(value: Coefficients | undefined): void;
}

export function QVConfigurator({ className, onCoefficientsChange }: Props) {
  const [coefficients, setCoefficients] = useState<Coefficients>([1000, 0, 0]);
  const { connection } = useConnection();
  const realm = useRealmQuery().data?.result;

  useEffect(() => {
    const fetchCoefficients = async () => {
      const coefficients = await getCoefficients(
        undefined,
        realm?.account.communityMint,
        connection,
      );

      const coefficientA = Number(coefficients[0].toFixed(2));

      setCoefficients([coefficientA, coefficients[1], coefficients[2]]);
      onCoefficientsChange([coefficientA, coefficients[1], coefficients[2]]);
    };

    // If the user wants to use a pre-existing token, we need to adjust the coefficients ot match the decimals of that token
    if (realm?.account.communityMint) {
      fetchCoefficients();
    }
  }, [connection, realm?.account.communityMint]);

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute top-0 left-2 w-0 h-24 border-l dark:border-neutral-700" />
        <div className="pt-10 pl-8">
          <div className="text-white font-bold mb-3">
            Quadratic Coefficients
          </div>
          <div className="relative">
            <div
              className={cx(
                'absolute',
                'border-b',
                'border-l',
                'top-2.5',
                'h-5',
                'mr-1',
                'right-[100%]',
                'rounded-bl',
                'w-5',
                'dark:border-neutral-700',
              )}
            />
            <div className="flex space-x-4">
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="1000"
                  defaultValue={coefficients[0]}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev);
                    const newCoefficients = [...coefficients];
                    newCoefficients[0] = Number(ev.target.value);
                    setCoefficients(newCoefficients as Coefficients);
                    onCoefficientsChange(newCoefficients as Coefficients);
                  }}
                />
                <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                  A
                </div>
              </div>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="0"
                  defaultValue={coefficients[1]}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev);
                    const newCoefficients = [...coefficients];
                    newCoefficients[1] = Number(ev.target.value);
                    setCoefficients(newCoefficients as Coefficients);
                    onCoefficientsChange(newCoefficients as Coefficients);
                  }}
                />
                <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                  B
                </div>
              </div>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="0"
                  defaultValue={coefficients[2]}
                  onChange={(ev) => {
                    preventNegativeNumberInput(ev);
                    const newCoefficients = [...coefficients];
                    newCoefficients[2] = Number(ev.target.value);
                    setCoefficients(newCoefficients as Coefficients);
                    onCoefficientsChange(newCoefficients as Coefficients);
                  }}
                />
                <div className="absolute top-1/2 right-4 text-neutral-500 -translate-y-1/2">
                  C
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 mb-4 text-sm dark:text-neutral-500">
            Advanced Option: Defaults have been set to an appropriate curve
            based on the community token. Please take a look at the Realms
            documentation to understand how changing the quadratic formula will
            affect voting.
          </div>
        </div>
      </div>
    </div>
  );
}
