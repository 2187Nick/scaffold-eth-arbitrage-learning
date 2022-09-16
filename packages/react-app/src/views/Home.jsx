import React, { useEffect, useState} from "react";
import { Excal } from "../components";
import { Button, Divider,  Select, Table } from "antd";
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
    const [eth_v2ArrayQuote, setEth_v2ArrayQuote] = useState([]);
    //const [profit, setProfit] = useState([]);
    const [realizedProfit, setRealizedProfit] = useState(0);

    async function flash3() {
    
      if (amountToBuy>0) {

        const amount = (amountToBuy*ETHER).toString()
        console.log("amount: ", amount)

        // Initiate the Arbitrage)
        const tx1 = await tx(writeContracts.UniswapV2toV3Arbitrage.flashSwapArb(amount));
        console.log("tx: ", tx1)
      
        const swapTxhash = await tx1.hash;
        console.log(swapTxhash);

        const receipt = await tx1.wait()
        console.log("receipt: ", receipt.logs)

        const event = receipt.events.find(x => x.event === "SentProfit");

        console.log("profit: ", utils.formatEther(event.args.profit)); 
        setRealizedProfit(parseFloat(utils.formatEther(event.args.profit)).toFixed(2))

      } 
    }
    
    async function main() {

    // Return the Reserves of FETH and FDAI UniSwap v2
    const pair_reserves = await uni_feth_fdai_contract.functions.getReserves();
    const feth_reserves = pair_reserves[1];
    const fdai_reserves = pair_reserves[0];
    console.log(`feth_reserves_v2: ${utils.formatEther(feth_reserves.toString())} FETH`)
    console.log(`fdai_reserves_v2: ${utils.formatEther(fdai_reserves.toString())} FDAI`)

    const ethArray1 = []
    const ethArray1_formatted = []

    const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()])

    //const ethArray2 = []
    const ethArray3 = []
    const ethArray3_formatted = []
    const ethArray_price = []

    // Fake DAI in gives us how much FETH we will get in exchange on V3
     for (let q=1; q<10; q++){
      const quotedAmountOutFETH = await quoterContract.callStatic.quoteExactInputSingle(
        immutables.token0,  // FDAI
        immutables.token1,  // FETH
        immutables.fee,
        ETHER.mul(q*spacing),  // Amount In
        0
      )
  
      const out1 = await quotedAmountOutFETH; //.toNumber();
      ethArray3.push(out1)
      ethArray3_formatted.push(utils.formatEther(out1))
      //console.log("FDAI IN equals FETH OUT on V3: ", utils.formatEther(out1))

    }
    setEth_v3ArrayQuote(ethArray3_formatted)

    // Fake F-ETH in gives us how much F-DAI we will get in exchange on V2
    for(let z=0; z<9; z++) {
      const amount_out = await uni_router_contract.functions.getAmountOut(
        ethArray3[z],
        feth_reserves,
        fdai_reserves
        );
      const amount = await amount_out.toString();
      //console.log("amountxxxETH: ", utils.formatEther(amount))
      ethArray1.push(amount_out)
      //console.log("ethArray1: ", ethArray1)
      ethArray1_formatted.push(utils.formatEther(amount))
    }

    setEth_v2ArrayX(ethArray1_formatted)

    // F-DAI in gives us how much F-ETH we will get in exchange on V2.  (This is just to calc exchange rate. To display)
    for(let z=0; z<9; z++) {
      const amount_out = await uni_router_contract.functions.getAmountOut(
        ETHER.mul((z+1)*spacing), // amount in
        fdai_reserves,
        feth_reserves
        );
      const amount = await amount_out.toString();
      //console.log("amountxxxETH: ", utils.formatEther(amount))
      //ethArray1.push(amount_out)
      //console.log("ethArray1: ", ethArray1)
      ethArray_price.push(utils.formatEther(amount))
    }

    setEth_v2ArrayQuote(ethArray_price)

    //  Take V2 FDAI  Amount out and Enter it as the amount in To Uni V3 
    /*for (let q=1; q<10; q++){
      const amountInFDAI = ethArray1[q-1]
      //console.log("amountInFDAI: ", amountInFDAI)
      const quotedAmountOutETH = await quoterContract.callStatic.quoteExactInputSingle(
        immutables.token0,  // FDAI
        immutables.token1, // FETH
        immutables.fee,
        amountInFDAI.toString(),
        0
      )
  
      const out = await quotedAmountOutETH; 
      ethArray2.push(utils.formatEther(out))

    }
    setEth_v3Array1(ethArray2) */
 
    const arr = [Number(parseFloat(ethArray1_formatted[0] - 1*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[1] - 2*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[2] - 3*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[3] - 4*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[4] - 5*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[5] - 6*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[6] - 7*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[7] - 8*spacing).toFixed(5)),Number(parseFloat(ethArray1_formatted[8] - 9*spacing).toFixed(5))];
    //console.log("arr: ", arr);
    const max = Math.max(...arr);
    //console.log("max: ", max)
    const index = arr.indexOf(max);
    //console.log("index: ", index);

    //setAmountToBuy((ethArray1[index]).toString())
    //if (index >= 0) { 
    if (max >= 0) {
      setAmountToBuy(spacing*(index+1))
    }
   

  }

  const columns = [
    {
      title: 'Borrow F-DAI (V2)',
      dataIndex: 'fdai',
      //width: 100,
    },
    {
      title: 'Convert F-DAI to F-ETH (V3)',
      dataIndex: 'feth',
      //width: 100,
    },
    {
      title: '1 F-DAI (V3)',
      dataIndex: 'v3rate',
      //width: 100,
    },
    {
      title: '1 F-DAI (V2)',
      dataIndex: 'v2rate',
      //width: 100,
    },
    {
      title: 'Convert F-ETH to F-DAI (V2)',
      dataIndex: 'fdaiV2',
      //width: 100,
    },
    {
      title: 'Profit',
      dataIndex: 'fdai_profit',
      //width: 100,
    }, 

 
  ];
  const data = [];
  
  for (let i = 1; i < 10; i++) {
    data.push({
      key: i,
      fdai: `${i*spacing}`,
      feth: ` ${Number.parseFloat(eth_v3ArrayQuote[i-1]).toFixed(4)}`,
      v3rate: ` ${Number.parseFloat(eth_v3ArrayQuote[i-1]/(spacing*i)).toFixed(4)}`,
      fdaiV2: ` ${Number.parseFloat(eth_v2ArrayX[i-1]).toFixed(4)}`,

      fdai_profit: ` ${Number.parseFloat((eth_v2ArrayX[i-1] - i*spacing)).toFixed(5)}`,
      v2rate: ` ${Number.parseFloat(eth_v2ArrayQuote[i-1]/(spacing*i)).toFixed(4)}`,
      
     
      //v2rate: ` ${Number.parseFloat(eth_v2ArrayX[i-1]/(spacing*i)).toFixed(4)}`,
    
    });
  }
  
  function Table2() {
    
    return <Table columns={columns} dataSource={data} size="middle" style={{ height: '500px', width: '1200px', align: 'center', position: "topCenter" }} />;
  };

  //  Optimal Amount to Borrow: {parseFloat(amountToBuy).toFixed(2)}  F-DAI <br></br><br></br>

  return (
    <div>
      <Divider></Divider>
      <div style={{ fontSize: 20 }}>
      Optimal Amount to Borrow: {amountToBuy}  F-DAI <br></br><br></br>
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
        Realized Profit: {realizedProfit}  F-ETH
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
