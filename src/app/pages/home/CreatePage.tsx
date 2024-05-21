import { Typography, Select } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputItem from '../../components/InputItem';
import CardItem from '../../components/common/CardItem';
import { ArrowIcon } from '../../../assets/icons/svg.tsx';

const CreatePage: React.FC = () => {
  const [option, setOption] = useState<string>('');
  const handleChange = () => {
    setOption('');
  };
  return (
    <div className="max-w-[1180px] mx-auto px-20">
      <div className="py-72 max-w-[516px] px-10 mx-auto">
        <div className="flex gap-8">
          <Link to="/" className="flex items-center">
            <img src="assets/icons/arrow-left.svg" alt="left arrow" />
          </Link>
          <Typography className="text-24 font-medium font-space text-white">
            Create New Bet
          </Typography>
        </div>
        <div className="mt-32 flex flex-col gap-24">
          <InputItem
            label="Bet Description"
            content={
              <CardItem className="py-10 px-16">
                <textarea
                  placeholder="Enter bet description"
                  className="bg-gray-80 w-full focus:outline-none text-white font-space text-16  rounded-8"
                ></textarea>
              </CardItem>
            }
          />
          <InputItem
            label="Oracle provides"
            content={
              <>
                <Select
                  value={option}
                  onChange={handleChange}
                  placeholder="Select oracle provider"
                  className="border-gray-70 border-1 bg-gray-80 rounded-8 focus:border-gray-60"
                  IconComponent={ArrowIcon}
                  sx={{
                    width: '100%',
                    outline: 0,
                    '&.Mui-focused fieldset': {
                      borderColor: '#4B5565 !important',
                    },
                  }}
                >
                  <Typography className="text-16 leading-20 font-space">title</Typography>
                </Select>
              </>
            }
          />
          <InputItem
            label="Expiration date"
            content={
              <CardItem className="py-10 px-16">
                <input
                  placeholder="Select expiration date"
                  className="bg-gray-80 w-full focus:outline-none text-white font-space text-16  rounded-8"
                ></input>
              </CardItem>
            }
          />
          <InputItem
            label="Odd"
            content={
              <CardItem className="py-10 px-16">
                <input
                  placeholder="Enter odd"
                  className="bg-gray-80 w-full focus:outline-none text-white font-space text-16  rounded-8"
                ></input>
              </CardItem>
            }
          />
          <InputItem
            label="Fee and rate"
            content={
              <CardItem className="py-10 px-16">
                <input
                  placeholder="Enter fee and rate"
                  className="bg-gray-80 w-full focus:outline-none text-white font-space text-16  rounded-8"
                ></input>
              </CardItem>
            }
          />
          <button
            type="button"
            className="w-full text-center py-10 text-14 leading-20 bg-primary-40 bg-opacity-30 rounded-8 font-space font-medium"
          >
            Create Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
