const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let accounts; // ganache accounts
let lottery; // instance

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    // instance of lottery contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
    it('Manager is correct', async () => {
        assert.equal(await lottery.methods.manager().call(), accounts[0]);
    });

    it('Can Enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.00011', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(players[0], accounts[0]);
        assert.equal(1, players.length);
    });

    it('Multiple players can enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.00011', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.00011', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.00011', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(players[0], accounts[0]);
        assert.equal(players[1], accounts[1]);
        assert.equal(players[2], accounts[2]);
        assert.equal(3, players.length);
    });

    it('Must send minimum ether to enter', async () => {
        let fail;
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.00009', 'ether')
            });
        } catch (err) {
            fail = err;
        } finally {
            if (!fail) {
                assert(false);
            }
        }
    });

    it('Only Manager can Pick Winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.00011', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.00011', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.00011', 'ether')
        });
       
        // test player
        let fail;
        try {
            await lottery.methods.pickWinner().call({
                from: accounts[1]
            });
        } catch (err) {
            fail = err;
        } finally {
            if (!fail) {
                assert(false);
            }
        }

        // test manager
        try {
            await lottery.methods.pickWinner().call({
                from: accounts[0]
            });
        } catch {
            assert(false);
        }
    });

    it('Picks Winner, sends money, resets players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether')
        });

        const initBal = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finBal = await web3.eth.getBalance(accounts[0]);

        // won't be exactly 1 due to gas fees
        const diff = finBal - initBal;
        assert(diff > web3.utils.toWei('0.8', 'ether'));
        
        // reset array
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(0, players.length);

        // balance of 0
        const bal = await lottery.methods.getBalance().call({
            from: accounts[0]
        });
        assert.equal(0, bal);
    });
});

// !! test if pickwinner is random and correct winner gets the money
// probably add a return value for pickwinner function, return the winner
// check that winner gets money
// run 1000 times with 10 accounts, see if distribution is around 100 wins for each
