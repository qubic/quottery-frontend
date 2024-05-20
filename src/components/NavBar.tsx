import { Link } from 'react-router-dom';
import { LockIcon, LogoIcon } from '../assets';
import { useScreen } from '../hooks/useScreen';
import React from 'react';

type NavBarProps = {
  hasLocker?: boolean;
};

const NavBar: React.FC<NavBarProps> = ({ hasLocker }) => {
  const { width } = useScreen();

  return (
    <header>
      <nav className="w-screen h-20 py-7 px-6 flex items-center relative border border-darkBorder">
        <Link to={'/'} className="w-fit flex mx-auto gap-2.5">
          <img src={LogoIcon.default} alt="" />
          <span className="font-medium text-2xl">
            qubic <span className="text-cyan-500">quottery</span>
          </span>
        </Link>

        {hasLocker && (
          <div className="absolute top-50 right-6 -translate-x-50 flex items-center gap-2.5">
            {width > 580 && (
              <button type="button" className="text-white/50 font-medium">
                Lock wallet
              </button>
            )}
            <div className="relative">
              <img
                src={LockIcon.default}
                alt=""
                className="cursor-pointer peer -mt-1"
              />

              {width < 580 && (
                <span className="peer-hover:opacity-100 opacity-0 absolute top-8 right-0 px-5 py-2.5 bg-dark/75 w-max rounded-lg transition-opacity duration-300">
                  Lock wallet
                </span>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export { NavBar };
