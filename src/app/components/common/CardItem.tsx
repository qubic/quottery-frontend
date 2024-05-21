import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardItemProps {
  children: ReactNode;
  className?: string;
}

const CardItem: React.FC<CardItemProps> = (props) => {
  const { children, className } = props;
  return (
    <div className={clsx('bg-gray-80 border-gray-70 border-[1px] rounded-8', className)}>
      {children}
    </div>
  );
};

export default CardItem;
