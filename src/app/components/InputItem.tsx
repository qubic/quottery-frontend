import { Typography } from '@mui/material';
import React, { ReactNode } from 'react';

interface InputItemProps {
  label: string;
  content: ReactNode;
}
const InputItem: React.FC<InputItemProps> = ({ label, content }) => {
  return (
    <div>
      <Typography className="mb-8 text-14 leading-20 text-white font-space">{label}</Typography>
      {content}
    </div>
  );
};

export default InputItem;
