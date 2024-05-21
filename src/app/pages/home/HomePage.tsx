import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import BetItem from '../../components/BetItem';
import { activeBetLists } from '../../../mockData/activeBetLists';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-[1180px] mx-auto px-20">
      <div className="py-72 text-center">
        <Typography className="font-space text-48 text-white font-medium">
          Bet on anything. <span className="text-primary-40">Anytime.</span>
        </Typography>
        <Typography className="mt-24 font-space text-18 text-white opacity-70">
          Quottery is p2p betting system
        </Typography>
        <div className="py-32">
          <Link
            to="/create"
            className=" text-primary-40 bg-primary-40 bg-opacity-10 text-14 leading-20 font-medium px-16 py-8 rounded-8"
            role="button"
          >
            Create Bet
          </Link>
          <div className="mt-48 flex flex-col gap-16">
            <div className="flex justify-between items-center">
              <Typography className="text-white text-18 font-space">Active bets</Typography>
              <Typography
                className="text-primary-40 font-space text-14 leading-20 font-medium px-20 py-10"
                role="button"
              >
                Filter Bets
              </Typography>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-16">
              {(activeBetLists || []).map((item, key) => (
                <BetItem key={key} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
