import React from 'react';
import { bets } from '../../helpers/constants';
import { CoinIcon } from '../../assets';
import { Link } from 'react-router-dom';

type BetItemProps = { bet: (typeof bets)[0] };

const BetItem: React.FC<BetItemProps> = ({ bet }) => {
  const { coins, description, expiresIn, fee, slotsLeft } = bet;

  const formattedFee = `${fee}%`;
  const formattedCoins = coins.toLocaleString('en');

  return (
    <Link
      to={'/bet/id'}
      className="p-6 flex flex-col gap-6 rounded-lg bg-dark border border-cardBorder hover:border-cyan-900 transition-colors duration-300"
    >
      <p className="h-full">{description}</p>

      <div className="flex gap-6">
        <div className="w-full">
          <span className="block text-white/50 text-xs">Expires in</span>
          <span className="leading-6">{expiresIn} days</span>
        </div>

        <div className="w-full ">
          <span className="block text-white/50 text-xs">Slots left</span>
          <span className="leading-6">{slotsLeft}</span>
        </div>

        <div className="w-full ">
          <span className="block text-white/50 text-xs">Fee</span>
          <span className="leading-6">{formattedFee}</span>
        </div>
      </div>

      <div className="space-x-3">
        <img src={CoinIcon.default} alt="" className="inline-block" />
        <span>{formattedCoins}</span>
      </div>
    </Link>
  );
};

export { BetItem };
