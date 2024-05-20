import React from 'react';
import { bets } from '../../helpers/constants';
import { BetItem } from './BetItem';

const Bets: React.FC = () => {
  return (
    <section className="mx-auto w-10/12 flex flex-col !mb-10 xl:w-full xl:max-w-6xl xl:mx-auto">
      <div className="py-2 flex items-center">
        <h5 className="font-medium text-lg mr-auto">Active bets</h5>
        <button
          type="button"
          className="px-5 py-2.5 text-medium text-sm text-cyan-500 hover:text-cyan-300 transition-colors"
        >
          Filter bets
        </button>
      </div>

      <div className="grid auto-rows-auto sm:grid-cols-[repeat(2,minmax(200px,1fr))] xl:grid-cols-[repeat(3,minmax(380px,1fr))] gap-4">
        {bets.map((bet, index) => (
          <BetItem key={index} bet={bet} />
        ))}
      </div>
    </section>
  );
};

export { Bets };
