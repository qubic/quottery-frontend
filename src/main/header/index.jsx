import { Link } from 'react-router-dom';
import logo from "../../assets/logo/logo-text-on-dark.svg"
import lock from "../../assets/lock.svg"
function Header() {
  return (
    <div className="h-[78px] relative flex max-w-[1920px] mx-auto gap-6 justify-center items-center border-b border-solid border-customBlue">
      <Link to="/network">
        <img src={logo} alt="logo" />
      </Link>
      <div className="absolute right-12 sm:right-24 flex gap-[10px] justify-center items-center">
        <span className='font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>Lock wallet</span>
        <img src={lock} alt="lock" className=' cursor-pointer' />
      </div>
    </div>
  );
}

export default Header;
