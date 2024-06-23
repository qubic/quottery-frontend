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

  const minMaxFee = () => {
    // get smallest and highest fee from data.oracle_fee array
    const min = Math.min(...data.oracle_fee)
    const max = Math.max(...data.oracle_fee)
    // if min and max are the same, return just one value
    if (min === max) 
      return <span>{min}</span>
    // otherwise
    return <span>{min} - {max}</span>
  }

  return (
    <Card 
      className="p-[24px] h-[210px] hover:border-primary-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-start justify-start gap-[24px]">
        <div className="text-white text-16">
          {data.bet_desc}
        </div>
        <div className="flex justify-between items-center w-full">
          <LabelData lbl="Expires in" value={data.expires_in} />
          <LabelData lbl="Slots left" value={data.slotsLeft} />
          <LabelData lbl="Fee %" value={minMaxFee()} />
        </div>
        <div className="gap-[12px] flex justify-center items-center">
          <img src={QubicCoin} alt="" />
          <span className="text-white text-18">
            {formatQubicAmount(data.current_total_qus)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default BetOverviewCard
