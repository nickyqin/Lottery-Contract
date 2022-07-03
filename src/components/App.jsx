import "../styles/App.css";
import React, { useEffect, useState } from "react";
import web3 from "../web3";
import lottery from "../lottery";

import Form from "./Form";
import PickWinner from "./PickWinner";

function App() {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState('');

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

  return (
    <div>
      <h1>Lottery Contract</h1>
      <p>Manager: {manager}</p>
      <p>{players.length} Players: {players.map((x, idx) => {
            return idx !== players.length - 1 ? x + ", " : x;
        })}</p>
      <p>Current Balance: {web3.utils.fromWei(balance, 'ether')} Ether</p>

      <Form updatePlayers={fetchPlayers} updateBalance={fetchBalance}/>
      <PickWinner updatePlayers={fetchPlayers} updateBalance={fetchBalance}/>
    </div>
  );
}
export default App;
