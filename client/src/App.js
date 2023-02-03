import { useEffect, useState } from "react";
import "./App.css";
import { ethers, Wallet } from "ethers";
import faucetContract from "./ethereum/faucet";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState();
  const [withDrawErr, setWithDrawErr] = useState("");
  const [withDrawSuccess, setWithDrawSuccess] = useState("");
  const [txnData, setTxnData] = useState("");
  const [modelStatus, setModelStatus] = useState(false);
  const [smartContractData, setSmartContractData] = useState();
  const [tokenTime, setTokenTime] = useState();
  const [ownerSettingMsg, setOwnerSettingMsg] = useState("");
  const [newToken, setNewToken] = useState(0);

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        // set provider
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // get accounts
        const accounts = await provider.send("eth_requestAccounts", []);
        
        // get signer
        setSigner(provider.getSigner());
        
        // local contract instance
        setFcContract(faucetContract(provider))

        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
        getSmartContractData()
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
      alert("Please install MetaMask")
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        // set provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // get accounts
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          // get signer
          setSigner(provider.getSigner());
          // local contract instance
          setFcContract(faucetContract(provider))
          
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
          getSmartContractData()
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
      // alert("Please install MetaMask")
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
        getSmartContractData()
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
      // alert("Please install MetaMask")
    }
  };

  const getCOTHandler = async () => {
    setWithDrawErr("")
    setWithDrawSuccess("")
    try {
      const fcContractWithSigner = await fcContract.connect(signer);
      const resp = await fcContractWithSigner.requestTokens();
      setWithDrawSuccess("Token successfully send to your address");
      setTxnData(resp.hash);
    } catch (err) {
      console.error(err);
      setWithDrawErr(err.message)
    }
  }

  const getSmartContractData = async () => {
    const fcContractWithSigner = await fcContract.connect(signer);
    const balanceOfSC = await fcContractWithSigner.getBalance();
    const lockTime = await fcContractWithSigner.lockTime();
    let hexString = lockTime._hex.toString(16);
    setSmartContractData({ "balance": ethers.utils.formatEther(balanceOfSC), "token_time":parseInt(hexString, 16) })
    // console.log(parseInt(hexString, 16))
  }

  const setLockTime = async () => {
    try {
      const fcContractWithSigner = await fcContract.connect(signer);
      const resp = await fcContractWithSigner.setLockTime(tokenTime);
      setOwnerSettingMsg("Lock time successfully set.");
    } catch (error) {
      console.error(error);
      setOwnerSettingMsg(error.message)
    }
  }

  // const handleNewToken = async () => {
  //   try {
  //     if (newToken > 0) {
  //       const fcContractWithSigner = await fcContract.connect(signer);
  //       const resp = await fcContractWithSigner.setWithdrawAmount(newToken);
  //       console.log(resp)
  //       setOwnerSettingMsg("Lock time successfully set.");
  //     } else {
  //       setOwnerSettingMsg("please add token");
  //     }

  //   } catch (error) {
  //     console.error(error);
  //     setOwnerSettingMsg(error.message)
  //   }
  // }

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">Coinic Token (COT)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
          <div className="navbar-end is-align-items-center">
            {walletAddress.toString() == '0xfb9ef9fb826d6fa565a9632590ef8099ca49636b' && (
              <button className="button is-white" onClick={() => setModelStatus(true)}>Change Contract Setting</button>
            )}
            </div>
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight-with-navbar">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Faucet</h1>
            <p>Fast and reliable. 50 COT/day.</p>
            <div className="mt-5">
              {withDrawErr && (
                <div className="withdraw-error">{withDrawErr}</div>
              )}
              {withDrawSuccess && (
                <div className="withdraw-success">{withDrawSuccess}</div>
              )}{" "}
            </div>
            
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                  />
                </div>
                <div className="column">
                  <button
                    className="button is-link is-medium"
                    onClick={() => getCOTHandler()}
                    disabled={walletAddress ? false : true}
                  >
                    GET TOKENS
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>{ txnData ? `Transcation hash ${txnData}` : "--"}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <div className={`modal is-clipped ${modelStatus ? 'is-active': ''}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Smart Contract setting</p>
            {/* {ownerSettingMsg && (
              <p>{ ownerSettingMsg }</p>
            )} */}
          <button class="delete" aria-label="close" onClick={() => setModelStatus(false)}></button>
        </header>
        <section class="modal-card-body">
          <table className="has-text-black">
              <tr>
                <td width="150px">Balance</td>  
                <td>{smartContractData ? smartContractData.balance : ''}</td>  
              </tr>
              <tr>
                <td>Token Time</td>  
                <td className="columns">
                  <input
                    className="input column"
                    type="text"
                    placeholder={smartContractData ? smartContractData.token_time : ''}
                    defaultValue={smartContractData ? smartContractData.token_time : ''}
                    onChange={(e) => setTokenTime(e.target.value)}
                  />
                  <button class="button is-primary column ml-5 p-0" onClick={() => setLockTime()}>Save</button>
                </td>  
              </tr>
              {/* <tr>
                <td>Add token to Contract</td>  
                <td className="columns">
                  <input
                    className="input column"
                    type="text"
                    placeholder="Enter number of token that you want to add to smart contract"
                    onChange={(e) => setNewToken(e.target.value)}
                  />
                  <button class="button is-primary column ml-5 p-0" onClick={() => handleNewToken()}>Save</button>
                </td>  
              </tr> */}
          </table>
        </section>
        <footer class="modal-card-foot">
          <button class="button" onClick={() => setModelStatus(false)}>Cancel</button>
        </footer>
      </div>
      </div>
    </div>
  );
}

export default App;
