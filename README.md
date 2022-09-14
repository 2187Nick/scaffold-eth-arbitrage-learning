# 🏗 Scaffold-ETH-Arbitrage-Learning

# Learn how to Use Flash Loans to Profit from Arbitrage Opportunities Uniswap V2 to V3 Goerli Testnet! 🚀

🧪 Quickly deploy and experiment with Solidity using a frontend that adapts to your smart contract

Try Live Demo: https://arby.surge.sh/

![arby](https://user-images.githubusercontent.com/75052782/190064747-295122f6-a20b-49df-a679-d4484e235a5b.jpg)

Connect with Goerli. Press Execute Arbitrage. The profit will arrive in your wallet.

View all the transactions on etherscan:
![arby2](https://user-images.githubusercontent.com/75052782/190064772-5a2a460f-ba6b-491c-9878-b9f7a8a273d0.jpg)

Visual representation of the process:
![arb_excal](https://user-images.githubusercontent.com/75052782/190064791-82fe4890-05d0-4ab9-a8dc-06e062adce8f.png)

# 🏄‍♂️ Quick Start


Code Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth-arbitrage-learning:

```bash
git clone https://github.com/2187Nick/scaffold-eth-arbitrage-learning.git
```

> install 👷‍:

```bash
cd scaffold-eth-arbitrage-learning
yarn install
```

> start your 📱 frontend:

```bash
yarn start
```

> in a second terminal window, 🛰 deploy your contract to Goerli:

```bash
cd scaffold-eth-arbitrage-learning
yarn deploy
```

📱 Open http://localhost:3000 to see the app.

```bash
To test the database we will write a message on the blockchain. Type message then click Send Message:
```

> code: await database.put({sender: update.from, message: newPurpose});

![write_msg_here](https://user-images.githubusercontent.com/75052782/183679702-38431c6b-78a9-421a-9f6f-3c7997bf76b9.png)

```bash
Verify the data was written to your Deta database:
```

![deta_first_entries](https://user-images.githubusercontent.com/75052782/183680362-ca9d5da4-7b98-4975-aa55-81bd1700c003.png)

```bash
Fetch Data pulls all data from the database:
```
> code: await database.fetch();

![fetch_all_data](https://user-images.githubusercontent.com/75052782/183679807-ecbe3777-d6ba-47f6-8824-72e3ee574201.png)

```bash
Next enter a message to pull it's details stored in the database.
```

![single_msg_details](https://user-images.githubusercontent.com/75052782/183679948-97d431dd-7196-4388-bee3-1f13a7cfc725.png)

```bash
To create a new database enter a name and click Create.
```

![second_db](https://user-images.githubusercontent.com/75052782/183693554-130b6e78-2e0f-4499-b1a6-1b609b31c590.png)

```bash
10 seconds later it will appear in the dropdown menu.
```

![second_db_dropdown](https://user-images.githubusercontent.com/75052782/183680186-809f0ea8-05de-4559-b0be-7be03fa879e8.png)

```bash
Select the new database and send a new message. Check Deta to verify the new database was created.
```

![second_db_deta](https://user-images.githubusercontent.com/75052782/183680464-f0db5e1c-4c3e-45c8-ae39-afa9e42c233b.png)



# In v2 we will deploy an Express.js API running on our free Deta virtual machine.


# 📚 Additional 

🔏 Edit the smart contract `UniswapV2toV3Arbitage.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`


# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)


# 🍦 Other Flavors
- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
- [scaffold-eth-tailwind](https://github.com/stevenpslade/scaffold-eth-tailwind)
- [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
- [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
- [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
- [eth-components](https://github.com/scaffold-eth/eth-components)
- [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)
- [scaffold-eth-truffle](https://github.com/trufflesuite/scaffold-eth)



# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/scaffold-eth/scaffold-eth/branches/active), [open issues](https://github.com/scaffold-eth/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

  
 - 🚤  [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


 - 🎟  [Create your first NFT](https://github.com/scaffold-eth/scaffold-eth/tree/simple-nft-example)
 - 🥩  [Build a staking smart contract](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-1-decentralized-staking)
 - 🏵  [Deploy a token and vendor](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-2-token-vendor)
 - 🎫  [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft)
 - 🎲  [Learn about commit/reveal](https://github.com/scaffold-eth/scaffold-eth-examples/tree/commit-reveal-with-frontend)
 - ✍️  [Learn how ecrecover works](https://github.com/scaffold-eth/scaffold-eth-examples/tree/signature-recover)
 - 👩‍👩‍👧‍👧  [Build a multi-sig that uses off-chain signatures](https://github.com/scaffold-eth/scaffold-eth/tree/meta-multi-sig)
 - ⏳  [Extend the multi-sig to stream ETH](https://github.com/scaffold-eth/scaffold-eth/tree/streaming-meta-multi-sig)
 - ⚖️  [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
 - 🦍  [Ape into learning!](https://github.com/scaffold-eth/scaffold-eth/tree/aave-ape)

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
