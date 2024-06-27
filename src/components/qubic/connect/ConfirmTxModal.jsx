// import ConfirmSlider from "../../ConfirmSlider"
import { useEffect, useState } from "react"
import Card from "../Card"
import { useQubicConnect } from "./QubicConnectContext"
import { useBetContext } from "../../../contexts/BetContext"

const ConfirmTxModal = ({ tx, open, onClose, onConfirm }) => {    
    const { getTick } = useQubicConnect()
    const { fetchBets } = useBetContext()
    
    const [confirmedTx, setConfirmedTx] = useState(null)
    const [initialTick, setInitialTick] = useState(null)
    const [tick, setTick] = useState(null)
    
    const refetchInterval = 3000

    useEffect(() => {
        let intervalId;
    
        const fetchTick = async () => {
          console.log("fetching tick");
          const t = await getTick();
          setTick(t);
        };
    
        if (confirmedTx) {
          fetchTick(); // Fetch immediately when confirmedTx is set
          intervalId = setInterval(fetchTick, refetchInterval);
        }
    
        return () => clearInterval(intervalId); // Cleanup interval on unmount or when confirmedTx changes
    }, [confirmedTx, getTick]);

    useEffect(() => {
        if (tick !== null && confirmedTx !== null && initialTick !== null) {
            const targetTick = confirmedTx.targetTick;
            const normalizedTick = ((tick - initialTick) / (targetTick - initialTick)) * 100;
            const widthPercentage = Math.min(Math.max(normalizedTick, 0), 100);
    
            //   console.log(`Initial tick: ${initialTick}`);
            //   console.log(`Current tick: ${tick}`);
            //   console.log(`Target tick: ${targetTick}`);
            //   console.log(`Width percentage: ${widthPercentage}%`);

            if (widthPercentage >= 100) {
                fetchBets()
                onClose()   
            }
        }
    }, [tick, confirmedTx, initialTick, fetchBets, onClose])

    const startTickFetchInterval = async (cTx) => {
        cTx.targetTick = cTx.targetTick + 8
        // Fetch initial tick value
        const initialTickValue = await getTick() 
        setInitialTick(initialTickValue)
        setConfirmedTx(cTx)
    }

    return (<>
        {open && <div 
            className="w-full p-5 h-full fixed top-0 left-0 overflow-x-hidden overflow-y-auto z-50 bg-smoke-light flex"
            onClick={() => onClose()}
        >
            <Card className="relative p-8 w-full max-w-md m-auto flex-col flex" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <div className="text-2xl text-white">qubic <span className="text-primary-40">connect</span></div>
                    <button onClick={onClose} className="text-2xl text-white">X</button>
                </div>                                
                <div className="flex flex-col gap-4 mt-4">
                    
                    {confirmedTx && <>
                            <p className="text-white">Current Tick: {tick} / {confirmedTx.targetTick}</p>                    
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{
                                        width: tick
                                          ? `${Math.min(
                                              Math.max(
                                                ((tick - initialTick) / (confirmedTx.targetTick - initialTick)) * 100,
                                                0
                                              ),
                                              100
                                            )}%`
                                          : "0%",
                                      }}>                                
                                </div>
                            </div>
                        </>
                    }

                    {!confirmedTx && <>
                        <p className="text-white">{tx.description}</p>
                        {/* <ConfirmSlider onConfirm={onConfirm} /> */}
                        <button 
                            className="bg-primary-40 p-4 rounded-lg"
                            onClick={async () => {
                                const confirmed = await onConfirm()
                                startTickFetchInterval(confirmed)
                            }}>I confirm!</button>
                        </>
                    }

                    <button  
                        className="bg-gray-50 p-4 rounded-lg"
                        onClick={() => onClose()}>Close</button>
                </div>
            </Card>
        </div>}
    </>)
}

export default ConfirmTxModal