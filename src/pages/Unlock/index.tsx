import React from 'react';
import { NavBar } from '../../components/NavBar';
import { Wallet } from '../../assets';

const UnlockWallet: React.FC = () => {
  return (
    <div className="flex flex-col gap-12">
      <NavBar />

      <main className="space-y-14 max-w-3xl w-full mx-auto text-center">
        <img src={Wallet.default} alt="" className="mx-auto" />

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Unlock Wallet</h1>
          <p className="text-xl text-white/50 px-4 sm:px-0">
            To access quottery, unlock your wallet first.
          </p>
        </div>

        <div className="flex flex-col mx-10 sm:flex-row sm:mx-20 gap-4">
          <input
            type="text"
            name="wallet-password"
            placeholder="Enter wallet password"
            className="placeholder:text-white/50 flex-1 px-4 py-2.5 col-span-2 rounded-lg border border-darkBorder bg-transparent outline-none"
          />

          <button className=" px-4 py-2.5 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500/15 transition-colors col-span-1">
            Upload wallet unlock file
          </button>
        </div>
      </main>
    </div>
  );
};

export default UnlockWallet;
