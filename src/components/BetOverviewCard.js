import React from "react"
import Card from "./qubic/Card"
import QubicCoin from "../assets/qubic-coin.svg"
import { formatQubicAmount } from "./qubic/util"
import MinMaxSpan from "./MinMaxSpan"
import LabelData from "./LabelData"
import { sumArray } from "./qubic/util"

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
          <LabelData lbl="Bet closes at" value={data.close_date + ' ' + data.close_time.slice(0, -3) + ' UTC'} />
          <LabelData lbl="Slots taken" value={sumArray(data.current_num_selection)} />
          <LabelData 
            lbl="Fee %" 
            value={sumArray(data.oracle_fee) + ' %'}
          />
          <LabelData 
            lbl="Burning" 
            value={'2 %'}
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
