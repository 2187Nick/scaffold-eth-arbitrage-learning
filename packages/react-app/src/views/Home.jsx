import React, { useEffect, useState, useRef } from "react";
import { Excal } from "../components";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, Select, Table } from "antd";
import { BigNumber,Contract,Wallet,providers,  utils, ethers } from "ethers";
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import 'antd/dist/antd.css';
import router_abi from "../contracts/uni_router_abi.json"
import uni_v2_abi from "../contracts/uni_v2_abi.json";
const { Option } = Select;

export default function Home({userSigner, address, localProvider, writeContracts, tx}) {
  
  const feth_address = "0x8c31113d8447Ab98D7F5B3c5d8726060886909F7";
  const fdai_address = "0x6EBF65eD1B4b546D436F656F164b3C79e0Fd60b8";

  const ETHER = BigNumber.from(10).pow(18);

  const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
  
  // Uni V2 Router   I can remove this later and do the calculation in the code here
  const uni_router_address = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
  const uni_router_abi = router_abi;
  const uni_router_contract = new Contract(uni_router_address, uni_router_abi, provider);

  // Uni V2 FETH/FDAI Pool
  const feth_fdai_UniV2_pool_address = "0x8Ad337c3bA80E0812f6C6E5FBC556517cFC921F0";
  const uni_feth_fdai_contract = new Contract(feth_fdai_UniV2_pool_address, uni_v2_abi, provider);

  // Uni V3 FETH/FDAI
  const uniV3_router_address = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
  const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
  const quoterContract = new ethers.Contract(quoterAddress, QuoterABI, provider)
  const feth_fdai_UniV3_pool_address = "0xb14b166D4D911C6921939FFA50bd5ae55C97639a";
  const poolContract = new ethers.Contract(feth_fdai_UniV3_pool_address, IUniswapV3PoolABI, provider)

  async function getPoolImmutables() {
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
      poolContract.factory(),
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.maxLiquidityPerTick(),
    ])

    const immutables = {
      factory,
      token0,
      token1,
      fee,
      tickSpacing,
      maxLiquidityPerTick,
    }
    return immutables
  }

  async function getPoolState() {
    const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])
    const PoolState = {
      liquidity,
      sqrtPriceX96: slot[0],
      tick: slot[1],
      observationIndex: slot[2],
      observationCardinality: slot[3],
      observationCardinalityNext: slot[4],
      feeProtocol: slot[5],
      unlocked: slot[6],
    }
    return PoolState
  }

  useEffect(() => {
    main();
  }, [  ]);  

    const [eth_v2ArrayX, setEth_v2ArrayX] = useState([]);
    const [eth_v3Array1, setEth_v3Array1] = useState([]);
    const [spacing, setSpacing] = useState(1);
    const [amountToBuy, setAmountToBuy] = useState(0);
    const [eth_v3ArrayQuote, setEth_v3ArrayQuote] = useState([]);
    const [realizedProfit, setRealizedProfit] = useState(0);

    async function flash3() {
    
      // Initiate the Arbitrage
      const tx1 = await tx(writeContracts.UniswapV2toV3Arbitrage.flashSwapArb(amountToBuy));
      console.log("tx: ", tx1)
    
      const swapTxhash = await tx1.hash;
      console.log(swapTxhash);

      const receipt = await tx1.wait()
      console.log("receipt: ", receipt.logs)

      const event = receipt.events.find(x => x.event === "SentProfit");

      console.log("profit: ", utils.formatEther(event.args.profit)); 
      setRealizedProfit(parseFloat(utils.formatEther(event.args.profit)).toFixed(2))
    
    }
    
    async function main() {

    // Return the Reserves of FETH and FDAI UniSwap v2
    const pair_reserves = await uni_feth_fdai_contract.functions.getReserves();
    const feth_reserves = pair_reserves[1];
    const fdai_reserves = pair_reserves[0];
    //console.log(`feth_reserves_v2: ${utils.formatEther(feth_reserves.toString())} FETH`)
    //console.log(`fdai_reserves_v2: ${utils.formatEther(fdai_reserves.toString())} FDAI`)

    const amount_in1 = ETHER.mul(spacing);
    const amount_in2 = ETHER.mul(spacing*2);
    const amount_in3 = ETHER.mul(spacing*3);
    const amount_in4 = ETHER.mul(spacing*4);
    const amount_in5 = ETHER.mul(spacing*5);
    const amount_in6 = ETHER.mul(spacing*6);
    const amount_in7 = ETHER.mul(spacing*7);
    const amount_in8 = ETHER.mul(spacing*8);
    const amount_in9 = ETHER.mul(spacing*9);

    const amount_ethV2 = [amount_in1, amount_in2,amount_in3,amount_in4,amount_in5,amount_in6,amount_in7,amount_in8,amount_in9]
    const uni_reserve_in = feth_reserves;
    const uni_reserve_out = fdai_reserves;

    const ethArray1 = []
    const ethArray1_formatted = []

    // Fake Eth in gives us how much FDAI we will get in exchange on V2
    for(let z=0; z<9; z++) {
      const amount_out = await uni_router_contract.functions.getAmountOut(
        amount_ethV2[z],
        uni_reserve_in,
        uni_reserve_out);
      const amount = await amount_out.toString();
      //console.log("amountxxxETH: ", utils.formatEther(amount))
      ethArray1.push(amount_out)
      //console.log("ethArray1: ", ethArray1)
      ethArray1_formatted.push(utils.formatEther(amount))
    }

    setEth_v2ArrayX(ethArray1_formatted)

    const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()])

    const ethArray2 = []
    const ethArray3 = []

     // Fake Eth in gives us how much FDAI we will get in exchange on V3
    for (let q=1; q<10; q++){
      const quotedAmountOutFDAI = await quoterContract.callStatic.quoteExactInputSingle(
        immutables.token0,  // FDAI
        immutables.token1,  // FETH
        immutables.fee,
        ETHER.mul(q*spacing),  // Amount In
        0
      )
  
      const out1 = await quotedAmountOutFDAI; //.toNumber();
      ethArray3.push(utils.formatEther(out1))

    }
    setEth_v3ArrayQuote(ethArray3)

    //const arr1 = [Number(parseFloat(eth_v3ArrayQuote[0] - 1*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[1] - 2*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[2] - 3*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[3] - 4*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[4] - 5*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[5] - 6*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[6] - 7*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[7] - 8*spacing).toFixed(5)),Number(parseFloat(eth_v3ArrayQuote[8] - 9*spacing).toFixed(5))];

    //  Take V2 FDAI  Amount out and Enter it as the amount in To Uni V3 
    for (let q=1; q<10; q++){
      const amountInFDAI = ethArray1[q-1]
      //console.log("amountInFDAI: ", amountInFDAI)
      const quotedAmountOutETH = await quoterContract.callStatic.quoteExactInputSingle(
        immutables.token0,
        immutables.token1,
        immutables.fee,
        amountInFDAI.toString(),
        0
      )
  
      const out = await quotedAmountOutETH; 
      ethArray2.push(utils.formatEther(out))

    }
    setEth_v3Array1(ethArray2)

    const arr = [Number(parseFloat(ethArray2[0] - 1*spacing).toFixed(5)),Number(parseFloat(ethArray2[1] - 2*spacing).toFixed(5)),Number(parseFloat(ethArray2[2] - 3*spacing).toFixed(5)),Number(parseFloat(ethArray2[3] - 4*spacing).toFixed(5)),Number(parseFloat(ethArray2[4] - 5*spacing).toFixed(5)),Number(parseFloat(ethArray2[5] - 6*spacing).toFixed(5)),Number(parseFloat(ethArray2[6] - 7*spacing).toFixed(5)),Number(parseFloat(ethArray2[7] - 8*spacing).toFixed(5)),Number(parseFloat(ethArray2[8] - 9*spacing).toFixed(5))];

    const max = Math.max(...arr);
    //console.log("max: ", max)
    const index = arr.indexOf(max);
    //console.log("index: ", index);

    setAmountToBuy((ethArray1[index]).toString())

  }

  const columns = [
    {
      title: 'Fake ETH (V2)',
      dataIndex: 'feth',
      //width: 100,
    },
    {
      title: 'Fake Dai (V2)',
      dataIndex: 'fdai',
      //width: 100,
    },
    {
      title: 'Exchange Rate (V2)',
      dataIndex: 'v2rate',
      //width: 100,
    },
    {
      title: 'Fake ETH (V3)',
      dataIndex: 'fethV3',
      //width: 100,
    },
    {
      title: 'Fake Dai (V3)',
      dataIndex: 'fdaiV3',
      //width: 100,
    },
    {
      title: 'Exchange Rate (V3)',
      dataIndex: 'v3rate',
      //width: 100,
    },
    {
      title: 'Profit',
      dataIndex: 'feth_profit',
      //width: 100
    },
    /*
    {
      title: 'Fake ETH OUT (V3)',
      dataIndex: 'feth2',
      //width: 100,
    }, */
  ];
  const data = [];
  
  for (let i = 1; i < 10; i++) {
    data.push({
      key: i,
      feth: `${i*spacing}`,
      fdai: ` ${Number.parseFloat(eth_v2ArrayX[i-1]).toFixed(4)}`,
      v2rate: ` ${Number.parseFloat(eth_v2ArrayX[i-1]/(spacing*i)).toFixed(4)}`,
      fethV3: `${i*spacing}`,
      fdaiV3: ` ${Number.parseFloat(eth_v3ArrayQuote[i-1]).toFixed(4)}`,
      v3rate: ` ${Number.parseFloat(eth_v3ArrayQuote[i-1]/(spacing*i)).toFixed(4)}`,
      feth_profit: ` ${Number.parseFloat((eth_v3Array1[i-1] - i*spacing)).toFixed(5)}`,
      
      //feth2: ` ${Number.parseFloat(eth_v3Array1[i-1]).toFixed(3)}`,
    });
  }
  
  function Table2() {
    
    return <Table columns={columns} dataSource={data} size="middle" style={{ height: '500px', width: '1200px', align: 'center', position: "topCenter" }} />;
  };

  return (
    <div>
      <Divider></Divider>
      <div style={{ fontSize: 20 }}>
      Optimal Amount to Borrow: {parseFloat(utils.formatEther(amountToBuy)).toFixed(2)}  Fake DAI <br></br><br></br>
      </div>
      <Button
            style={{ fontSize: 16}}
            onClick={async () => {
              flash3();         
            }}
          >
            Execute Arbitrage
        </Button><br></br><br></br>

        <div style={{ fontSize: 18 }}>
        Realized Profit: {realizedProfit}  Fake ETH
        </div>
      <Divider></Divider>

      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Table2 ></Table2>
      </div>

      <Divider></Divider>
      
      
       <div style={{ margin: 8 }}>
       <Select
        onChange={async (value) => {
          setSpacing(value);
          
        }} 
        showSearch
        style={{
          width: 200,
        }}
        placeholder="Spacing"
        optionFilterProp="children"
        filterOption={(input, option) => option.includes(input)}
        filterSort={(optionA, optionB) =>
          optionA.toLowerCase().localeCompare(optionB.toLowerCase())
        }
      >
        <Option value="1">1</Option>
        <Option value="5">5</Option>
        <Option value="25">25</Option>
        <Option value="50">50</Option>
        <Option value="100">100</Option>
        <Option value="1000">1000</Option>
        <Option value="10000">10000</Option>
      </Select>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              main();         
            }}
          >
            Update Prices
          </Button>
      </div>

      <Divider></Divider>

      <div style={{ margin: 32 }}>
        <span style={{ marginRight: 8 }}>👷</span>
        Next Step: Users can select any tokens to monitor
      </div>
      <Excal></Excal>
      <Divider></Divider>
    </div>
  );
}
