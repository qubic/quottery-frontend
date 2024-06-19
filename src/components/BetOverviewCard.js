import React from "react"
import Card from "./qubic/Card"
import QubicCoin from "../assets/qubic-coin.svg"
import { formatQubicAmount } from "./qubic/util"

function BetOverviewCard({ data, onClick }) {

  const LabelData = ({lbl, value}) => (
    <div className="flex flex-col justify-center items-center">
      <span className="text-gray-50 text-12">
        {lbl}
      </span>
      <span className="text-white text-16">
        {value}
      </span>
    </div>
  )

  return (
    <Card 
      className="p-[24px] h-[210px] hover:border-primary-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-start justify-start gap-[24px]">
        <div className="text-white text-16">
          {data.title}
        </div>
        <div className="flex justify-between items-center w-full">
          <LabelData lbl="Expires in" value={data.expireDay} />
          <LabelData lbl="Slots left" value={data.slotsLeft} />
          <LabelData lbl="Fee" value={data.fee} />
        </div>
        <div className="gap-[12px] flex justify-center items-center">
          <img src={QubicCoin} alt="" />
          <span className="text-white text-18">
            {formatQubicAmount(data.amount)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default BetOverviewCard
