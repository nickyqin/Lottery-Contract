import React, {useState} from "react";
import lottery from "./../lottery";
import web3 from "./../web3";

function PickWinner(props) {
    const [isPicking, setPicking] = useState(false);
    const [isError, setError] = useState(false);

    async function handleWinner(e) {
        e.preventDefault();
        const accounts = await web3.eth.getAccounts();
    
        setPicking(true);

        try {

            await lottery.methods.pickWinner().send({
                from: accounts[0]
            });
            props.updateBalance();
            props.updatePlayers();

        } catch {
            setError(true);
        }
        
        setPicking(false);
      }

    return (
        <div>
            <button 
            onClick={handleWinner} 
            disabled={isPicking}>
                Pick Winner</button>

            {isError && (
                <p>Only the manager can pick the winner</p>
            )}
        </div>
    );
}

export default PickWinner;