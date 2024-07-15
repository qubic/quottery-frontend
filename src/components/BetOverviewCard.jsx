import React from "react"
import Card from "./qubic/Card"
import QubicCoin from "../assets/qubic-coin.svg"
import { formatQubicAmount } from "./qubic/util"
import LabelData from "./LabelData"
import { sumArray } from "./qubic/util"

function BetOverviewCard({ data, onClick }) {

  return (
    <Card
      className="p-[15px] h-[240px] hover:border-primary-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-start justify-start gap-[24px]">
        <div className="text-white text-20">
          {data.bet_desc}
        </div>
        <div className="grid grid-cols-2 justify-between items-center w-full">
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
        <div className="gap-[12px] flex justify-center items-center size-full">
          <img src={QubicCoin} alt="" />
          <span className="text-white text-18">
            {formatQubicAmount(data.current_total_qus)} QUBIC
          </span>
        </div>
      </div>
    </Card>
  )
}

export default BetOverviewCard
