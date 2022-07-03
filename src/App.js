import "./App.css";
import React, { useEffect, useState } from "react";
import web3 from "./web3";
import lottery from "./lottery";

function App() {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState('');
  const [amt, setAmt] = useState('');
  const [isEntering, setEntering] = useState(false);
  const [isPicking, setPicking] = useState(false);

  useEffect(() => {
    fetchManager();
    fetchPlayers();
    fetchBalance();
  }, []);

  async function fetchManager() {
    const man = await lottery.methods.manager().call(); /* Don't have to specify from property - metamask provider automatically chooses first account */
    setManager(man);
  }

  async function fetchPlayers() {
    const _players = await lottery.methods.getPlayers().call();
    setPlayers(_players);
  }

  async function fetchBalance() {
    const bal = await lottery.methods.getBalance().call();
    // OR: web3.eth.getBalance(lottery.options.address)
    setBalance(bal);
  }

  // enter, pickwinner
  function handleChange(e) {
    setAmt(e.target.value);
  }

  async function handleEnter(e) {
    e.preventDefault();
    if (amt < 0.0001) {
      alert("Please enter a valid amount");
      return;
    }

    const accounts = await web3.eth.getAccounts();

    setEntering(true);

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(amt, 'ether')
    });

    setEntering(false);
    fetchPlayers();
    fetchBalance();
  }

  async function handleWinner(e) {
    e.preventDefault();
    const manager = await lottery.methods.manager().call();
    const accounts = await web3.eth.getAccounts();
    if (manager !== accounts[0]) {
      alert("Only manager has permission!");
      return;
    }

    setPicking(true);
    await lottery.methods.pickWinner().call();
    setPicking(false);
    fetchBalance();
    fetchPlayers();
  }

  return (
    <div>
      <h1>Lottery Contract</h1>
      <p>Manager: {manager}</p>
      <p>{players.length} Players: {players.map((x, idx) => {
            return idx !== players.length - 1 ? x + ", " : x;
        })}</p>
      <p>Current Balance: {web3.utils.fromWei(balance, 'ether')} Ether</p>

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
      
      <button onClick={handleWinner} disabled={isPicking}>Pick Winner</button>
    </div>
  );
}
export default App;
