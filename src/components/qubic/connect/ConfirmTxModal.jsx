// import ConfirmSlider from "../../ConfirmSlider"
import Card from "../Card"
// import { useQubicConnect } from "./QubicConnectContext"

const ConfirmTxModal = ({ tx, open, onClose, onConfirm }) => {
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
                    <p className="text-white">{tx.description}</p>
                    {/* <ConfirmSlider onConfirm={onConfirm} /> */}
                    <button 
                        className="bg-primary-40 p-4 rounded-lg"
                        onClick={() => onConfirm()}>I confirm!</button>
                    <button  
                        className="bg-gray-50 p-4 rounded-lg"
                        onClick={() => onClose()}>Cancel</button>
                </div>
            </Card>
        </div>}
    </>)
}

export default ConfirmTxModal