import React, {useState} from "react";
import lottery from "./../lottery";
import web3 from "./../web3";

function Form(props) {
    const [amt, setAmt] = useState('');
    const [isEntering, setEntering] = useState(false);
    const [isError, setError] = useState(false);

    async function handleEnter(e) {
        e.preventDefault();
        if (amt < 0.0001) {
          alert("Please enter a valid amount");
          return;
        }

        setError(false); // clear error message from screen if necessary
    
        const accounts = await web3.eth.getAccounts();
    
        setEntering(true);
    
        try {

            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei(amt, 'ether')
            });
            props.updatePlayers();
            props.updateBalance();

        } catch (err) {
            setError(true);
        }
    
        setEntering(false);
    }

    function handleChange(e) {
        setAmt(e.target.value);
    }

    return (
        <form>
                <h3>Enter Lottery:</h3>
                <input
                name="amount"
                onChange={handleChange}
                value={amt}
                placeholder="Enter lottery amount (ETH)"
                />
                <button onClick={handleEnter} disabled={isEntering}>Enter</button>
                {isEntering && (
                <p>Processing your entry! This will take several seconds.</p>
                )}
                {isError && (<p>Error handling your entry!</p>)}
        </form>
    );
}

export default Form;