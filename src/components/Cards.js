import React from "react";
import CardItem from "./CardItem";
import vector from "../assets/vector.svg";

function Cards(props) {
  const { data } = props;

  return (
    <>
      <CardItem className="p-[24px]">
        <div className="flex flex-col items-start justify-start gap-[24px]">
          <div className=" font-space text-white text-[16px] leading-[24px]">
            {data.title}
          </div>
          <div className=" flex justify-between items-center w-full">
            <div className=" flex flex-col justify-center items-center">
              <span className=" font-space text-gray-50 text-[12px] leading-[16px]">
                Expires in
              </span>
              <span className=" font-space text-white text-[16px] leading-[24px]">
                {data.expireDay}
              </span>
            </div>
            <div className=" flex flex-col justify-center items-start">
              <span className=" font-space text-gray-50 text-[12px] leading-[16px]">
                Slots left
              </span>
              <span className=" font-space text-white text-[16px] leading-[24px]">
                {data.slotsLeft}
              </span>
            </div>
            <div className=" flex flex-col justify-center items-center">
              <span className=" font-space text-gray-50 text-[12px] leading-[16px]">
                Fee
              </span>
              <span className=" font-space text-white text-[16px] leading-[24px]">
                {data.fee}
              </span>
            </div>
          </div>
          <div className=" gap-[12px] flex justify-center items-center">
            <img src={vector} alt="" vector />
            <span className="font-space text-white text-[18px] leading-[23px]">
              {data.amount}
            </span>
          </div>
        </div>
      </CardItem>
    </>
  );
}

export default Cards;
