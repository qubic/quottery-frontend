import { Typography } from '@mui/material';
import React from 'react';
import { formatString } from '../../utils/functions';
import CardItem from './common/CardItem';

interface BetItemProps {
  title: string;
  expireDate: number;
  leftSlot: number;
  fee: number;
  amount: number;
}
const BetItem: React.FC<BetItemProps> = ({ title, expireDate, leftSlot, fee, amount }) => {
  return (
    <CardItem className="p-24 ">
      <div className="flex flex-col gap-24">
        <Typography className="text-white text-16 leading-24 text-left font-space">
          {title}
        </Typography>
        <div className="grid grid-cols-3">
          <div className="flex flex-col text-left ">
            <Typography className="text-12 leading-16 text-gray-50 font-space">
              Expires in
            </Typography>
            <Typography className="text-16 leading-24 text-white font-space">
              {expireDate} days
            </Typography>
          </div>
          <div className="flex flex-col text-left ">
            <Typography className="text-12 leading-16 text-gray-50 font-space">
              Slots left
            </Typography>
            <Typography className="text-16 leading-24 text-white font-space">
              {leftSlot}/5
            </Typography>
          </div>
          <div className="flex flex-col text-left ">
            <Typography className="text-12 leading-16 text-gray-50 font-space">Fee</Typography>
            <Typography className="text-16 leading-24 text-white font-space">{fee}%</Typography>
          </div>
        </div>
        <div className="flex gap-12">
          <img src="assets/icons/bet-icon.svg" alt="Bet Icon" />
          <Typography className="text-16 leading-24 text-white font-space font-medium">
            {formatString(amount)}
          </Typography>
        </div>
      </div>
    </CardItem>
  );
};

export default BetItem;
