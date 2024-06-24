import React from "react"
import Card from "./qubic/Card"
import QubicCoin from "../assets/qubic-coin.svg"
import { formatQubicAmount } from "./qubic/util"
import MinMaxSpan from "./MinMaxSpan"
import LabelData from "./LabelData"

function BetOverviewCard({ data, onClick }) {

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
          <LabelData 
            lbl="Fee %" 
            value={<MinMaxSpan values={data} prop={'oracle_fee'} />} 
          />
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
