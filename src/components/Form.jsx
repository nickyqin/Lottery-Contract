import React, {useState} from "react";



function Form() {
    const [amt, setAmt] = useState('');
    const [isEntering, setEntering] = useState(false);

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
        </form>
    );
}

export default Form;