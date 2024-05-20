import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <div className=" border-b-1 bg-gray-90 border-gray-75">
      <div className="relative flex max-w-[1440px] min-h-[80px] mx-auto gap-6 justify-center items-center">
        <Link to="/">
          <img src="assets/images/logo/logo-text-on-dark.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
};

export default Header;
