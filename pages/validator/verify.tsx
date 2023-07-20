// import { Application } from '@verify-wallet/constants'
// import VerifyPage from '@verify-wallet/components'
// import { GlobalFooter } from '@verify-wallet/components/footer';
// import cx from '@hub/lib/cx';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ValidatorVerifyPage = () => {
  // const parsedLocationHash = new URLSearchParams(
  //   window.location.search.substring(1)
  // )
  const [publicKey, setPublicKey] = useState('');
  const [payload, setPayload] = useState('');
  const [signedPayload, setSignedPayload] = useState('');
  const [authCode, setAuthCode] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (router && router.query && router.query.code) {
      setAuthCode(String(router.query.code));
    }
  }, [router, router.query]);


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      alert('Failed to copy text');
    }
  };

  // local
  return (
    <div className="flex flex-col justify-center items-center h-screen p-4 text-center bg-gray-100 text-black">
      <h1 className="text-3xl font-medium mt-8">Follow the steps to get verified:</h1>
      <p className="italic underline text-center text-neutral-700 mt-4">Do NOT give this information to other parties. If you have any questions or concerns, reach out in the Solana Tech Discord.</p>
      <div className="text-left text-black p-4">
        <input
          type="text"
          className="border rounded text-base mb-2 w-full p-2"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="1. Enter your public key (command: solana address)"
        />
        <p className="text-base text-neutral-700 mt-4">2. Make sure the Solana CLI ({">= 1.16"}) is installed and configured. See the <a href="https://docs.solana.com/cli/install-solana-cli-tools" className="underline text-black">Solana CLI installation guide</a> for more information.</p>
        <p className="text-base text-neutral-700 mt-4">3. Send a cURL command with your validator public key to receive a timebound “challenge” payload.</p>
        <div className="flex justify-between mb-2">
          <pre className="p-4 bg-gray-200 rounded"> 
            {`curl -X POST http://localhost:3001/verify-gossip-keypair \\`}<br />
            {`-H 'Content-Type: application/json' \\`}<br />
            {`-d '{"code":`}{`"`}{authCode ? authCode : ':discord-authorization-code'}{`"`}, {`"publicKey":`}{`"`}{publicKey ? publicKey : ':public-key'}{`"`}{`}'`}
          </pre>
          {/* <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`curl -X GET realms.today/api/verify-gossip-keypair/${publicKey ? publicKey : ':public-key'} -public-key VALIDATOR_PUBLIC_KEY`)}>Copy</button> */}
        </div>
        <input
          type="text"
          className="border rounded text-base mb-2 w-full p-2"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="4. Paste the payload from the response here"
        />
        <p className="text-base text-neutral-700 mt-4">5. Sign the payload (JSON) from step 2 using the gossip keypair using the Solana CLI’s sign-offchain-message command.</p>
        <div className="flex justify-between mb-2">
          <pre className="p-4 bg-gray-200 rounded">{`solana sign-offchain-message "`}{payload ? payload : ':payload'}{`"`}</pre>
          {/* <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`solana sign-offchain-message PAYLOAD`)}>Copy</button> */}
        </div>
        <input
          type="text"
          className="border rounded text-base mb-2 w-full p-2"
          value={signedPayload}
          onChange={(e) => setSignedPayload(e.target.value)}
          placeholder="6. Paste the signed payload here"
        />
        <p className="text-base text-neutral-700 mt-4">7. POST the signed payload to the endpoint to get verified with the correct credentials</p>
        <div className="flex justify-between">
            <pre className="p-4 bg-gray-200 rounded">
              {`curl -X POST http://localhost:3001/verify-gossip-keypair/`}{publicKey ? publicKey : ':public-key'}{'/'}{authCode ? authCode : ':discord-authorization-code'} {` \\`}<br />
              {`-H 'Content-Type: application/json' \\`}<br />
              {`-d '{"signature": "`}{signedPayload ? signedPayload : ':signed_payload'}{`"}'`}
            </pre>
          {/* <pre className="p-4 bg-gray-200 rounded">curl -X POST realms.today/api/verify-gossip-keypair/{publicKey ? publicKey : ':public-key'}/{authCode ? authCode : ':discord-authorization-code'} -payload PAYLOAD</pre> */}
          {/* <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`curl -X POST realms.today/api/verify-gossip-keypair/${publicKey ? publicKey : ':public-key'}/{authCode ? authCode : ':discord-authorization-code'} -payload PAYLOAD`)}>Copy</button> */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen p-4 text-center bg-gray-100 text-black">
      <h1 className="text-3xl font-medium mt-8">Follow the steps to get verified:</h1>
      <p className="italic underline text-center text-neutral-700 mt-4">Do NOT give this information to other parties. If you have any questions/concerns, reach out in the Solana Tech Discord.</p>
      <div className="text-left text-black p-4">
        <input
          type="text"
          className="border rounded text-base mb-2 w-full p-2"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="Enter your public key"
        />
        <p className="text-base text-neutral-700 mt-4">1. Make sure the Solana CLI ({">= 1.16"}) is installed and configured. See the <a href="https://docs.solana.com/cli/install-solana-cli-tools" className="underline text-black">Solana CLI installation guide</a> for more information.</p>
        <p className="text-base text-neutral-700 mt-4">2. Send a cURL command with your validator public key to realms.today/api/verify-gossip-keypair/:public-key to receive a timebound “challenge” payload.</p>
        <div className="flex justify-between mb-2">
          <pre className="p-4 bg-gray-200 rounded">curl -X GET realms.today/api/verify-gossip-keypair/{publicKey ? publicKey : ':public-key'} -public-key VALIDATOR_PUBLIC_KEY</pre>
          <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`curl -X GET realms.today/api/verify-gossip-keypair/${publicKey ? publicKey : ':public-key'} -public-key VALIDATOR_PUBLIC_KEY`)}>Copy</button>
        </div>
        <p className="text-base text-neutral-700 mt-4">3. Sign the payload using the gossip keypair using the Solana CLI’s sign-offchain-message command.</p>
        <div className="flex justify-between mb-2">
          <pre className="p-4 bg-gray-200 rounded">solana sign-offchain-message PAYLOAD</pre>
          <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`solana sign-offchain-message PAYLOAD`)}>Copy</button>
        </div>
        <p className="text-base text-neutral-700 mt-4">4. POST the signed payload to realms.today/api/verify-gossip-keypair/{publicKey ? publicKey : ':public-key'}/{authCode ? authCode : ':discord-authorization-code'}</p>
        <div className="flex justify-between">
          <pre className="p-4 bg-gray-200 rounded">curl -X POST realms.today/api/verify-gossip-keypair/{publicKey ? publicKey : ':public-key'}/{authCode ? authCode : ':discord-authorization-code'} -payload PAYLOAD</pre>
          <button className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={() => copyToClipboard(`curl -X POST realms.today/api/verify-gossip-keypair/${publicKey ? publicKey : ':public-key'}/{authCode ? authCode : ':discord-authorization-code'} -payload PAYLOAD`)}>Copy</button>
        </div>
      </div>
    </div>
  );
}

export default ValidatorVerifyPage
