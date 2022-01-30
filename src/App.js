import $, { type } from "jquery";
import "bootstrap";
import moment from "moment";
import MetaMaskOnboarding from "@metamask/onboarding";
import "regenerator-runtime/runtime";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import WalletConnectProvider from "@walletconnect/web3-provider";
import tokenStakingAbi from "./abis/tokenStakingUpgradeableAbi.json";
import ierc20Abi from "./abis/ierc20UpgradeableAbi.json";

var NATIVE_TOKEN_DECIMALS = 18;
var NATIVE_TOKEN_NAME = "CLC";
var FALLBACK_CHAIN = "0x4";

var w3;
var loggedProvider;
var user = {};
var network;
var w3sender;
var loggedProvider = null;
var stakes = [];
var stakePackages = {};
var stakingContract;
var nativeTokenContractAddress;
var nativeTokenContract;
var packageLength;
var stakesLength;

const w3Strings = {
  "0x1": { alchemyLink: "", name: "Mainnet" },
  "0x3": { alchemyLink: "", name: "Ropsten" },
  "0x2a": { alchemyLink: "", name: "Kovan" },
  "0x4": {
    alchemyLink:
      "https://eth-rinkeby.alchemyapi.io/v2/OXYLvOt732PZgLee2mpprVhBdXs-hagV",
    name: "Rinkeby",
  },
  "0x5": {
    alchemyLink:
      "https://eth-goerli.alchemyapi.io/v2/rd7h-yzXVEw1K3kk6satHa0rbPii3h7W",
    name: "Goerli",
  },
  "0x61": {
    alchemyLink:
      "https://data-seed-prebsc-1-s1.binance.org:8545",
    name: "BscTestnet",
  },
  1: { alchemyLink: "", name: "Mainnet" },
  3: { alchemyLink: "", name: "Ropsten" },
  "2a": { alchemyLink: "", name: "Kovan" },
  4: {
    alchemyLink:
      "https://eth-rinkeby.alchemyapi.io/v2/OXYLvOt732PZgLee2mpprVhBdXs-hagV",
    name: "Rinkeby",
  },
  5: {
    alchemyLink:
      "https://eth-goerli.alchemyapi.io/v2/rd7h-yzXVEw1K3kk6satHa0rbPii3h7W",
    name: "Goerli",
  },
};

const walletConnectProvider = new WalletConnectProvider({
  infuraId: "170c865e43d744018c55057af1ca442e",
});

var isMobile = false; //initiate as false
// device detection
if (
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4)
  )
) {
  isMobile = true;
}

var isChrome = false;
if (window.chrome && !window.opr) {
  isChrome = true;
}

function toContractDecimals(amount, dec) {
  amount = new BigNumber(parseFloat(amount).toFixed(dec));
  var r = amount.times(new BigNumber(Math.pow(10, dec)));
  return r.toFixed();
}

function fromContractDecimals(amount, dec) {
  amount = parseFloat(amount) / Math.pow(10, dec);
  return amount;
}

var initVal = setInterval(function () {
  if (typeof ethereum != "undefined" && !ethereum.chainId) {
    return;
  } else init();
}, 500);

async function init() {
  clearInterval(initVal);

  network =
    typeof ethereum != "undefined" && ethereum.chainId
      ? ethereum.chainId
      : FALLBACK_CHAIN;

  w3 = await new Web3(w3Strings[network].alchemyLink);

  setStakeInterface();

  if (
    typeof ethereum !== "undefined" &&
    localStorage.getItem("checkMetamaskLogin") == 1
  ) {
    w3.eth.getAccounts().then(function (acc) {
      if (ethereum.selectedAddress) {
        loginMetaMask();
      }
    });
  } else {
    setNotLoggedState();
  }

  if (!isMobile && (isChrome || navigator.userAgent.search("Firefox") > -1)) {
    $(".log-metamask").show();
    console.log(navigator.userAgent, isChrome);
  } else {
    $(".log-metamask").hide();
  }

  checkButtonState();

  $(".focus-input100.amount").attr(
    "data-placeholder",
    "Stake Amount (" + NATIVE_TOKEN_NAME + ")"
  );
}

async function setStakeInterface() {
  var readContract = new w3.eth.Contract(
    tokenStakingAbi.abi,
    tokenStakingAbi.address
  );
  packageLength = await readContract.methods.packageLength().call();

  var html = "<option></option>";

  for (var pKey = 0; pKey < packageLength; pKey++) {
    var packageName = await readContract.methods.packageNames(pKey).call();
    var packageValues = await readContract.methods.packages(packageName).call();
    stakePackages[packageName] = packageValues;
    html +=
      '<option value="' +
      packageName +
      '">' +
      w3.utils.toAscii(packageName) +
      " (" +
      stakePackages[packageName]["_packageInterest"] +
      "% every " +
      stakePackages[packageName]["_daysLocked"] +
      " days)</option>";
  }

  $(".select-package").html(html);

  console.log("package length", stakePackages);
}

async function web3Loaded() {
  stakingContract = new w3sender.eth.Contract(
    tokenStakingAbi.abi,
    tokenStakingAbi.address
  );
  nativeTokenContractAddress = await stakingContract.methods
    .tokenContract()
    .call();
  nativeTokenContract = new w3sender.eth.Contract(
    ierc20Abi.abi,
    nativeTokenContractAddress
  );

  updateInterface();
}

function getBestPackage() {
  var max = 0;
  var bestPackage = null;
  for (var pKey in stakePackages) {
    if (parseFloat(stakePackages[pKey]._packageInterest) > max) {
      max = parseFloat(stakePackages[pKey]._packageInterest);
      bestPackage = stakePackages[pKey];
    }
  }
  return bestPackage;
}

async function setTokenBalance() {
  var stakesLength = await stakingContract.methods
    .stakesLength(user.address)
    .call();
  if (!stakes.length || stakes.length < stakesLength) {
    setTimeout(setTokenBalance, 500);
    return;
  }

  try {
    user.tokenBalance = fromContractDecimals(
      await nativeTokenContract.methods.balanceOf(user.address).call(),
      NATIVE_TOKEN_DECIMALS
    );
  } catch (e) {
    user.tokenBalance = 0;
  }
  $(".max-amount-tokens").show();
  $(".max-amount-tokens-text").text(
    user.tokenBalance.toFixed(5) + " " + NATIVE_TOKEN_NAME
  );

  user.totalStakedBalance = parseFloat(
    fromContractDecimals(
      await stakingContract.methods.totalStakedBalance(user.address).call(),
      NATIVE_TOKEN_DECIMALS
    )
  );

  user.currentlyStakedBalance = user.totalStakedBalance;
  user.totalRewardsToken = 0;
  user.historicalRewardsToken = 0;

  for (var sKey in stakes) {
    if (!stakes[sKey].amountNormalized) {
      setTimeout(setTokenBalance, 500);
      return;
    }

    user.historicalRewardsToken += stakes[sKey].normalizedAccumulatedInterest;

    if (stakes[sKey]._withdrawnTimestamp == 0) {
      user.totalRewardsToken += stakes[sKey].normalizedAccumulatedInterest;
    }

    user.totalStakedBalance +=
      stakes[sKey]._withdrawnTimestamp != 0 ? stakes[sKey].amountNormalized : 0;
    //user.currentlyStakedBalance-=stakes[sKey]._withdrawnTimestamp!=0?stakes[sKey].amountNormalized:0;
  }
  console.log(user.totalStakedBalance, user.currentlyStakedBalance);
  $(".general-staked-balance").text(
    user.totalStakedBalance.toFixed(4) + " " + NATIVE_TOKEN_NAME
  );
  $(".general-currently-staked-balance").text(
    user.currentlyStakedBalance.toFixed(4) + " " + NATIVE_TOKEN_NAME
  );
  $(".general-interest").text(
    user.totalRewardsToken.toFixed(4) + " " + NATIVE_TOKEN_NAME
  );
  $(".general-historical-rewards").text(
    user.historicalRewardsToken.toFixed(4) + " " + NATIVE_TOKEN_NAME
  );

  var bpackage = getBestPackage();
  $(".general-best-deal").text(w3.utils.toAscii(bpackage._packageName));
  $(".general-best-deal-reward").text(
    bpackage._packageInterest + "% in " + bpackage._daysLocked + " days"
  );
}

function setLoggedState() {
  $(".address-panel").text(user.address.substr(0, 11) + "...");
  $(".address-full").text(user.address);
  $(".balance-panel").text(Math.floor(user.balance * 1000) / 1000 + " ETH");
  $(".connected-panel .net-text").text(w3Strings[network].name);
  $(".logged-in").show();
  $(".logged-out").hide();
  logged = true;
}

function setProviderEvents(provider) {
  provider.on("accountsChanged", function (accounts) {
    console.log("account changed", accounts);
    loginWeb3(provider);
  });

  provider.on("chainChanged", function (networkId) {
    console.log("network changed", networkId);
    w3 = new Web3(w3Strings[networkId].alchemyLink);
    loginWeb3(provider);
  });

  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
    logged = false;
    setNotLoggedState();
  });
}

function pollMetaLogin() {
  var metalog = setInterval(function () {
    if (ethereum.selectedAddress) {
      clearImmediate(metalog);
    }
  }, 1000);
}

function installMetamask() {
  const onboarding = new MetaMaskOnboarding();
  onboarding.startOnboarding();
}

async function logWalletConnect() {
  loggedProvider = "walletConnect";
  var prov = await walletConnectProvider.enable();
  loginWeb3(walletConnectProvider);
}

function loginMetaMask() {
  if (typeof ethereum == "undefined") {
    installMetamask();
    return;
  }

  ethereum.request({ method: "eth_requestAccounts" }).then(
    function (e) {
      localStorage.setItem("checkMetamaskLogin", 1);
      loggedProvider = "metamask";
      loginWeb3(ethereum);
    },
    function (err) {
      console.log(err);
      if (err.code == -32002) {
        errorModal(
          "Oups!",
          "MetaMask already pending login. Please open it from the browser extensions and come back"
        );
        pollMetaLogin();
      }
    }
  );
}

var logged = false;

function setNotLoggedState() {
  $(".logged-out").show();
  $(".logged-in").hide();
  $("#stake-button-text").text("Connect Provider");
  $(".stake-button").attr("disabled", false);
}

function getState() {
  if (typeof ethereum != "undefined" && loggedProvider == "metamask") {
    user.address = ethereum.selectedAddress;
    network = ethereum.chainId;
  } else {
    console.log(walletConnectProvider);
    user.address = walletConnectProvider.accounts[0];
    network = walletConnectProvider.chainId;
  }
}

async function updateStakes() {
  stakesLength = await stakingContract.methods
    .stakesLength(user.address)
    .call();

  if (
    $.isEmptyObject(stakePackages) ||
    Object.keys(stakePackages).length < packageLength
  ) {
    setTimeout(updateStakes, 500);
    return;
  }

  stakes = [];
  for (var sKey = 0; sKey < stakesLength; sKey++) {
    var stake = await stakingContract.methods.stakes(user.address, sKey).call();
    console.log(stake);
    stakes.push(stake);
  }

  drawStakes(stakes);
}

async function drawStakes(stakes) {
  var activeStakesHTML = "";
  var historyStakesHTML = "";

  for (var sKey in stakes) {
    var stakeRewardToken = await stakingContract.methods
      .checkStakeReward(user.address, sKey)
      .call();
    stakes[sKey].accumulatedInterest = stakeRewardToken.yieldReward;

    stakes[sKey].normalizedAccumulatedInterest = parseFloat(
      fromContractDecimals(
        stakes[sKey].accumulatedInterest,
        NATIVE_TOKEN_DECIMALS
      )
    );
    stakes[sKey].amountNormalized = parseFloat(
      fromContractDecimals(stakes[sKey]._amount, NATIVE_TOKEN_DECIMALS)
    );
    if (stakes[sKey]._withdrawnTimestamp == 0) {
      activeStakesHTML += `
        <div class="row col-xs-12" style="border-bottom: 1px solid; padding-top: 10px; padding-bottom: 10px;">
            <div class="row col-md-6">
            <div style="white-space: pre; font-size: 75%;line-height: 18px;" class="col-md-4">${moment
              .unix(stakes[sKey]._timestamp)
              .format("YYYY-MM-DD HH:mm:ss")}</div>
            <div style="white-space: pre; font-size: 75%;line-height: 18px;" class="col-md-4">${moment
              .unix(stakes[sKey]._timestamp)
              .add(
                stakePackages[stakes[sKey]._packageName]["_daysLocked"],
                "days"
              )
              .format("YYYY-MM-DD HH:mm:ss")}</div>
            <div class="col-md-2">#${sKey}</div>
            <div style="font-size: 85%;white-space:nowrap;" class="col-md-2">${stakes[
              sKey
            ].amountNormalized.toFixed(4)}</div>
            </div>
            <div class="row col-md-6">
            <div style="font-size: 85%;" class="col-md-3">${NATIVE_TOKEN_NAME}</div>
            <div style="font-size: 85%;" class="col-md-3">${
              stakePackages[stakes[sKey]._packageName]._packageInterest
            }%</div>
            <div style="font-size: 85%;white-space:nowrap;" class="col-md-3">${
              parseFloat(
                stakes[sKey].normalizedAccumulatedInterest +
                  stakes[sKey].amountNormalized
              ).toFixed(4) +
              " " +
              NATIVE_TOKEN_NAME
            }</div>
            <div class="col-md-3">
                <svg xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;margin-right: 8px;" width="22" height="22" fill="currentColor" stake="${sKey}" class="unstake-button bi bi-cash-stack" viewBox="0 0 16 16">
                    <path d="M14 3H1a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1h-1z"/>
                    <path fill-rule="evenodd" d="M15 5H1v8h14V5zM1 4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H1z"/>
                    <path d="M13 5a2 2 0 0 0 2 2V5h-2zM3 5a2 2 0 0 1-2 2V5h2zm10 8a2 2 0 0 1 2-2v2h-2zM3 13a2 2 0 0 0-2-2v2h2zm7-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;" width="22" height="22" fill="currentColor" stake="${sKey}" class="refresh-stake-button bi bi-arrow-repeat" viewBox="0 0 16 16">
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                    <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg>
            </div>
            </div>
        </div>
        `;
    } else {
      historyStakesHTML += `
        <div class="row col-xs-12" style="border-bottom: 1px solid; padding-top: 10px; padding-bottom: 10px;">
            <div class="row col-md-6">
            <div style="white-space: pre; font-size: 75%;line-height: 18px;" class="col-md-4">${moment
              .unix(stakes[sKey]._timestamp)
              .format("YYYY-MM-DD HH:mm:ss")}</div>
            <div style="white-space: pre; font-size: 75%;line-height: 18px;" class="col-md-4">${moment
              .unix(stakes[sKey]._withdrawnTimestamp)
              .format("YYYY-MM-DD HH:mm:ss")}</div>
            <div class="col-md-2">#${sKey}</div>
            <div style="font-size: 85%;white-space:nowrap;" class="col-md-2">${stakes[
              sKey
            ].amountNormalized.toFixed(4)}</div>
            </div>
            <div class="row col-md-6">
            <div style="font-size: 85%;" class="col-md-3">${NATIVE_TOKEN_NAME}</div>
            <div style="font-size: 85%;" class="col-md-3">${
              stakePackages[stakes[sKey]._packageName]._packageInterest
            }%</div>
            <div style="font-size: 85%;white-space:nowrap;" class="col-md-3">${
              parseFloat(
                stakes[sKey].normalizedAccumulatedInterest +
                  stakes[sKey].amountNormalized
              ).toFixed(4) +
              " " +
              NATIVE_TOKEN_NAME
            }</div>
            <div class="col-md-3">
                <svg xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;" width="22" height="22" fill="currentColor" class="bi bi-cash-stack" viewBox="0 0 16 16">
                    <path d="M14 3H1a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1h-1z"/>
                    <path fill-rule="evenodd" d="M15 5H1v8h14V5zM1 4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H1z"/>
                    <path d="M13 5a2 2 0 0 0 2 2V5h-2zM3 5a2 2 0 0 1-2 2V5h2zm10 8a2 2 0 0 1 2-2v2h-2zM3 13a2 2 0 0 0-2-2v2h2zm7-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                    <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg>
            </div>
            </div>
        </div>
        `;
    }
  }

  $(".active-stakes").html(activeStakesHTML);
  $(".history-stakes").html(historyStakesHTML);
}

function unstake(stakeId) {
  //---grant role---
  // var transaction=stakingContract.methods.grantRole("0xe56e19a7d558c827e5fe3dd17249e3d1e70e83b18ea8e11167d41e0a83cdd168",user.address).send({
  //     from:user.address
  // });

  //-- add reward --
  // var transaction=stakingContract.methods.addStakedTokenReward("6624209999999999929100").send({
  //     from:user.address
  // });

  var transaction = stakingContract.methods.unstakeTokens(stakeId).send({
    from: user.address,
  });

  startTransaction(transaction);
}

function validateInputs(amount, stakingPackage, type) {
  if (isNaN(amount)) return "Please Select a valid amount";
  if (!stakingPackage) return "Please Select a staking package";
  if (typeof type == "undefined") return "Please Select the staking type";
  return false;
}

function executeStakeAction() {
  var amount = $('input[name="amount"]').val();
  var stakingPackage =
    document.getElementsByClassName("select-package")[0].value;
  var type = 0;

  var err = validateInputs(amount, stakingPackage, type);
  if (!err) {
    stakeChainActions(amount, stakingPackage, type);
  } else {
    alert(err);
  }
}

var inTransaction = false;

async function updateInterface() {
  await updateStakes();
  setTokenBalance();
}

function startTransaction(transaction) {
  inTransaction = true;
  checkButtonState();
  transaction
    .on("receipt", function () {
      inTransaction = false;
      checkButtonState();
      updateInterface();
    })
    .catch(function (err) {
      //handle error of approval
      console.warn("approval error", err);
      inTransaction = false;
      checkButtonState();
      updateInterface();
    });

  setTimeout(function () {
    inTransaction = false;
    checkButtonState();
    updateInterface();
  }, 25000);
}

function getApproval() {
  return nativeTokenContract.methods
    .allowance(user.address, tokenStakingAbi.address)
    .call();
}

async function stakeChainActions(amount, stakingPackage, type) {
  var approval = await getApproval();

  if (
    approval <= parseFloat(toContractDecimals(amount, NATIVE_TOKEN_DECIMALS))
  ) {
    console.log("spending start");

    var transaction = nativeTokenContract.methods
      .approve(
        tokenStakingAbi.address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
      .send({
        from: user.address,
      });

    startTransaction(transaction);
  } else {
    stakeTokens(amount, stakingPackage, type);
  }
}

function stakeTokens(amount, stakingPackage, type) {
  var tr = stakingContract.methods
    .stakeTokens(
      toContractDecimals(amount, NATIVE_TOKEN_DECIMALS),
      stakingPackage
    )
    .send({
      from: user.address,
    });

  startTransaction(tr);
}

async function checkButtonState() {
  var buttonText = "";
  var buttonDisabled = false;

  var stakingPackage =
    document.getElementsByClassName("select-package")[0].value;

  if (!stakingContract) {
    buttonText = "Choose Provider";
  } else {
    var amount = parseFloat($('input[name="amount"]').val());
    var approval = await getApproval();
    console.log(approval);
    if (amount && !isNaN(amount)) {
      if (!stakingPackage) {
        buttonDisabled = true;
        buttonText = "Choose Package";
      } else {
        if (approval > amount) {
          buttonText = "Stake";
        } else {
          buttonText = "Approve Spending";
        }
      }
    } else {
      buttonDisabled = true;
      buttonText = "Enter Amount";
    }
  }

  if (inTransaction) {
    buttonText = "Loading...";
    buttonDisabled = true;
  }

  console.log(buttonText);

  $("#stake-button-text").text(buttonText);
  $(".stake-button").attr("disabled", buttonDisabled);

  buttonDisabled
    ? $(".container-login100-form-btn").addClass("disabledBtn")
    : $(".container-login100-form-btn").removeClass("disabledBtn");

  inTransaction ? $(".loader-5").show() : $(".loader-5").hide();
}

function loginWeb3(provider) {
  w3sender = new Web3(provider);

  getState();

  if (user.address && network) {
    console.log(network);
    w3 = new Web3(w3Strings[network].alchemyLink);

    w3.eth.getBalance(user.address, async (err, balance) => {
      user.balance = w3.utils.fromWei(balance, "ether");
      setLoggedState();
      await web3Loaded();
      setProviderEvents(provider);
      checkButtonState();
    });
  } else {
    setNotLoggedState();
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var currentStakeId = null;
(function () {
  $(document).on("click", ".log-metamask", function () {
    loginMetaMask();
  });

  $(document).on("click", ".log-walletconnect", function () {
    logWalletConnect();
  });

  $(document).on("click", ".stake-button", function () {
    if (!logged) {
      $("#provider-modal").modal("toggle");
    } else {
      executeStakeAction();
    }
  });

  var debouncedCheckButtonState = debounce(function () {
    console.log("checkdebounced");
    checkButtonState();
  }, 500);

  $(document).on("keyup", 'input[name="amount"]', debouncedCheckButtonState);

  $(document).on(
    "change",
    'select[name="select-package"]',
    debouncedCheckButtonState
  );

  $(document).on(
    "click",
    ".refresh-active-stakes,.refresh-stake-button",
    function () {
      updateStakes();
    }
  );

  $(document).on("click", ".unstake-button", function () {
    currentStakeId = $(this).attr("stake");
    $(".info-stake-reward").text(
      stakes[currentStakeId].normalizedAccumulatedInterest
    );
    $(".info-stake-amount").text(stakes[currentStakeId].amountNormalized);
    $(".info-stake-token").text(NATIVE_TOKEN_NAME);
    $("#unstake-modal").modal("toggle");
  });

  $(document).on("click", ".unstake-agree", function () {
    unstake(currentStakeId);
  });

  $(document).on("click", ".max-amount-tokens", function () {
    $('input[name="amount"').val(user.tokenBalance.toFixed(4));
    $('input[name="amount"').focus();
  });

  $(document).on("click", ".logout-provider", async function () {
    if (typeof ethereum != "undefined" && loggedProvider == "metamask") {
      localStorage.setItem("checkMetamaskLogin", 0);
    } else if (walletConnectProvider.connected) {
      try {
        await walletConnectProvider.close();
      } catch (e) {
        logged = false;
        setNotLoggedState();
      }
    }
    location.reload();
  });

  /*==================================================================
    [ Focus input ]*/
  $(".input100").each(function () {
    $(this).on("blur", function () {
      if ($(this).val().trim() != "") {
        $(this).addClass("has-val");
      } else {
        $(this).removeClass("has-val");
      }
    });
  });

  /*==================================================================
    [ Validate ]*/
  var input = $(".validate-input .input100");

  $(".validate-form").on("submit", function () {
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    return check;
  });

  $(".validate-form .input100").each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
  });

  function validate(input) {
    if ($(input).attr("type") == "email" || $(input).attr("name") == "email") {
      if (
        $(input)
          .val()
          .trim()
          .match(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
          ) == null
      ) {
        return false;
      }
    } else {
      if ($(input).val().trim() == "") {
        return false;
      }
    }
  }

  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass("alert-validate");
  }

  function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass("alert-validate");
  }

  /*==================================================================
    [ Show pass ]*/
  var showPass = 0;
  $(".btn-show-pass").on("click", function () {
    if (showPass == 0) {
      $(this).next("input").attr("type", "text");
      $(this).find("i").removeClass("zmdi-eye");
      $(this).find("i").addClass("zmdi-eye-off");
      showPass = 1;
    } else {
      $(this).next("input").attr("type", "password");
      $(this).find("i").addClass("zmdi-eye");
      $(this).find("i").removeClass("zmdi-eye-off");
      showPass = 0;
    }
  });
})();
