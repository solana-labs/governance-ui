import WarningIcon from '@carbon/icons-react/lib/Warning';
import { pipe } from 'fp-ts/function';
import { TypeOf } from 'io-ts';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { useMutation } from '@hub/hooks/useMutation';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { EditForms } from './EditForms';
import * as gql from './gql';

type Data = TypeOf<typeof gql.getMetadataResp>['realmByUrlId'];

interface Props {
  className?: string;
  newRealmMode?: boolean;
  realmUrlId: string;
}

export function EditMetadata(props: Props) {
  const [data, setData] = useState<RE.Result<Data>>(RE.pending());
  const [result] = useQuery(gql.getMetadataResp, {
    query: gql.getMetadata,
    variables: { urlId: props.realmUrlId },
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [, saveMetadata] = useMutation(gql.saveMetadataResp, gql.saveMetadata);

  useEffect(() => {
    setData(
      pipe(
        result,
        RE.map(({ realmByUrlId }) => realmByUrlId),
      ),
    );
  }, [result._tag]);

  return (
    <div className={props.className}>
      {pipe(
        data,
        RE.match(
          () => <div />,
          () => <div />,
          (realm) => (
            <div>
              <Head>
                <title>Edit Metadata - {realm.name}</title>
                <meta
                  property="og:title"
                  content={`Edit Metadata - ${realm.name}`}
                  key="title"
                />
              </Head>
              {!realm.amAdmin && (
                <div
                  className={cx(
                    'backdrop-blur-lg',
                    'bg-white/30',
                    'bottom-0',
                    'fixed',
                    'flex',
                    'items-center',
                    'justify-center',
                    'left-0',
                    'p-8',
                    'right-0',
                    'top-0',
                    'z-20',
                  )}
                >
                  <div className="flex flex-col space-y-3 items-center">
                    <div className="flex items-center space-x-2">
                      <WarningIcon className="h-7 w-7 fill-rose-500" />
                      <div className="font-bold text-2xl text-neutral-900">
                        Forbidden
                      </div>
                    </div>
                    <div className="text-neutral-700 text-center">
                      You are not authorized to edit this Realm's metadata
                    </div>
                  </div>
                </div>
              )}
              <EditForms
                data={realm}
                newRealmMode={props.newRealmMode}
                saveError={saveError || undefined}
                onSave={async (updates) => {
                  const resp = await saveMetadata({
                    publicKey: realm.publicKey.toBase58(),
                    realm: updates,
                  });

                  const result = pipe(
                    resp,
                    RE.map(({ updateRealmMetadata }) => updateRealmMetadata),
                  );

                  if (RE.isFailed(result)) {
                    setSaveError(result.error.toString());
                  } else {
                    setSaveError(null);
                  }

                  setData(result);
                  return RE.isOk(result);
                }}
              />
            </div>
          ),
        ),
      )}
    </div>
  );
}
