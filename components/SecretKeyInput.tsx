import { TrashIcon } from '@heroicons/react/outline';
import { LockClosedIcon } from '@heroicons/react/solid';
import { Keypair } from '@solana/web3.js';
import { useState } from 'react';

const SecretKeyInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: Keypair | null;
  onChange: (value: Keypair | null) => void;
  placeholder: string;
  className?: string;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string>(
    value ? value.secretKey.toString() : '',
  );

  return (
    <div>
      <div className={`flex flex-col relative ${className ?? ''}`}>
        <LockClosedIcon className="w-5 h-5 absolute left-2.5 top-2.5 text-fgd-3" />

        <input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-10 focus:outline-none focus:border-primary-light bg-bkg-1 p-3 w-full border border-fgd-3 text-sm text-fgd-1 rounded-md h-10"
          value={secretKey}
          onChange={(evt) => {
            const secretKey = evt.target.value;
            setSecretKey(secretKey);

            try {
              const formattedSecretKey = Uint8Array.from(JSON.parse(secretKey));
              const keypair = Keypair.fromSecretKey(formattedSecretKey);

              onChange(keypair);
              setMessage(null);
            } catch {
              setMessage('Secret key is incorrect');
            }
          }}
        />

        {value ? (
          <TrashIcon
            className="w-5 h-5 absolute right-2.5 top-2.5 text-fgd-3 pointer hover:text-white"
            onClick={() => {
              onChange(null);
              setMessage(null);
              setSecretKey('');
            }}
          />
        ) : null}
      </div>

      {message ? <span className="text-red">{message}</span> : null}
    </div>
  );
};

export default SecretKeyInput;
