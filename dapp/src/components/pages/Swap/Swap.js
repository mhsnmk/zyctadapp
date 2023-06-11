import React, { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  IconButton,
  makeStyles,
  Popper,
} from "@material-ui/core";
import { connect, useSelector } from "react-redux";
import SwapCardItem from "./SwapCardItem";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import { useState } from "react";
import SwapSettings from "../../common/SwapSettings";
import {
  allowanceAmount,
  corgibAllowance,
  DEFAULT_SWAP_TOKENS,
  FARM_TOKEN,
  NATIVE_TOKEN,
  ROUTER_ADDRESS,
  swapFnConstants,
  TOKEN_ADDRESS,
  TransactionStatus,
} from "../../../constants/index";
import {
  getPriceRatio,
  getTokenToSelect,
  isMetaMaskInstalled,
  toWei,
} from "../../../utils/helper";
import { importToken } from "../../../actions/dexActions";
import TransactionConfirm from "../../common/TransactionConfirm";

import { Info, Settings } from "@material-ui/icons";
import TabPage from "../../TabPage";
import store from "../../../store";
import { START_TRANSACTION } from "../../../actions/types";
import { default as NumberFormat } from "react-number-format";
import { useLocation } from "react-router";
import { useTokenData } from "../../../contexts/TokenData";
import { useTradeExactIn, useTradeExactOut } from "../../../hooks/useTrades";
import { Token, TokenAmount, JSBI, WETH } from "@tiwatoyin/storm-swap-sdk";
import { wrappedCurrency } from "../../../hooks/wrappedCurrency";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { isAddress } from "../../../utils/contractUtils";
import { computeTradePriceBreakdown } from "../../../utils/prices";
import BigNumber from "bignumber.js";
import { useCurrencyBalances } from "../../../hooks/useBalance";
import { useUserAuthentication } from "../../../hooks/useUserAuthentication";
import { useTokenAllowance } from "hooks/useAllowance";
import { CONNECTOR_TYPE } from "connection/connectionConstants";
import { whitelist } from "components/common/whitelist";
const useStyles = makeStyles((theme) => ({
  card: {
    width: "96%",
    maxWidth: 500,
    borderRadius: 30,
    boxShadow: `rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px`,
    backgroundColor: theme.palette.primary.bgCard,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 25,
    marginLeft: "auto",
    marginRight: "auto",
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 7,
      paddingRight: 7,
      width: "96%",
    },
  },
  cardOverall: {
    width: "96%",
    maxWidth: 500,
    boxShadow: "none",
    backgroundColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      width: "96%",
    },
  },
  cardContents: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardHeading: {
    width: "95%",
    paddingBottom: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingIcon: {
    color: theme.palette.primary.iconColor,
    fontSize: 22,
    cursor: "pointer",
    transition: "all 0.4s ease",
    [theme.breakpoints.down("sm")]: {
      fontSize: 22,
    },
  },
  iconButton: {
    margin: "30px 0 30px 0",
    padding: 2,
    backgroundColor: theme.palette.primary.iconBack,
    borderRadius: "30%",
  },
  swapIcon: {
    color: theme.palette.primary.iconColorGold,
    marginTop: -12,
    marginBottom: -12,
    borderRadius: "36%",
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: theme.palette.primary.iconBack,
    transition: "all 0.4s ease",
    fontSize: 28,
    backgroundColor: theme.palette.primary.iconBack,
  },
  advancedButton: {
    marginTop: 30,
    backgroundColor: theme.palette.common.black,
    color: "#fff",
    width: "100%",
    textTransform: "none",
    fontSize: 19,
    borderRadius: 20,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "30px",
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "12px 50px 12px 50px",
    "&:hover": {
      background: theme.palette.common.black,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
  centerItems: {
    display: "flex",
    justtifyContent: "space-between",
    alignItems: "center",
  },
  swapButton: {
    marginTop: 30,
    backgroundImage: theme.palette.primary.pbrSwap,
    color: "#fff",
    width: "100%",
    textTransform: "none",
    fontSize: 19,
    borderRadius: 20,
    marginLeft: "auto",
    marginRight: "auto",
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "12px 50px 12px 50px",
    "&:hover": {
      background: "rgba(61 90 254)",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },

  rotate1: {
    transform: "rotateZ(0deg)",
  },
  rotate2: {
    transform: "rotateZ(-180deg)",
  },
  priceRatio: {
    display: "flex",
    width: "70%",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,
  },
  tokenPrice: {
    color: theme.palette.textColors.headingWhite,
    textAlign: "right",
    width: 430,
    fontSize: 13,

    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  infoIcon: {
    color: "#fff",
    fontSize: 16,
  },
  txDetailsCard: {
    backgroundColor: "black",
    height: "100%",
    width: 320,
    borderRadius: 10,
    marginTop: 5,
    padding: 14,
    color: "#fff",
    fontSize: 12,
  },

  txDetailsValue: {
    color: "#fff",
    fontSize: 14,
    paddingBottom: 5,
  },
  heading: {
    color: theme.palette.textColors.headingwhite,
    letterSpacing: -0.7,
    fontSize: 18,
    fontWeight: 500,
  },
  certikLabel: {
    textAlign: "center",
    color: theme.palette.primary.iconColor,
    fontWeight: 600,
    fontSize: 14,
    paddingTop: 3,
    // marginBottom: 4,
  },
  ankrLabel: {
    textAlign: "center",
    color: theme.palette.primary.iconColor,
    fontSize: 12,
    paddingTop: 3,
  },
  hackenLabel: {
    textAlign: "center",
    color: "#50DDA0",
    fontSize: 12,
    paddingTop: 3,
  },
  icon: {
    width: 25,
    height: "100%",
  },
}));

const Swap = (props) => {
  const {
    dex: { transaction, tokenList },
    importToken,
  } = props;

  const classes = useStyles();
  const [settingOpen, setOpen] = useState(false);

  const [selectedToken0, setToken1] = useState({});

  const [selectedToken1, setToken2] = useState({});
  const [token1Value, setToken1Value] = useState("");
  const [token2Value, setToken2Value] = useState("");

  const [rotate, setRotate] = useState(false);

  const [swapDialogOpen, setSwapDialog] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleTxPoper = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const [currentSwap, setCurrentSwapFn] = useState({
    tradeType: swapFnConstants.swapExactOut,
    swapFn: swapFnConstants.swapETHforExactTokens,
  });

  const { chainId, isActive, account } = useActiveWeb3React();

  const { connectWallet } = useUserAuthentication();

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  const query = new URLSearchParams(useLocation().search);

  const [token0Query, token1Query] = [
    query.get("inputCurrency"),
    query.get("outputCurrency"),
  ];

  const selectedChain = useSelector((state) => state.account?.currentChain);

  // check allowance on token selection
  useEffect(() => {
    async function updateSelectionState() {
      if (!selectedToken0.symbol || !selectedToken1.symbol) {
        clearInputState();
      }

      if (selectedToken0.symbol && selectedToken1.symbol) {
        // reset token input on token selection
        clearInputState();
      }
    }
    updateSelectionState();
  }, [selectedToken0, selectedToken1, chainId, account]);

  // init default token selection on load
  useEffect(() => {
    async function initSelection() {
      // set default chain to ethereum if not connected to wallet

      if (token0Query) {
        const _token = getTokenToSelect(tokenList, token0Query);

        if (!_token || !_token.symbol) {
          importToken(token0Query, account, chainId);
        }
        setToken1(_token);
      } else {
        const _token = getTokenToSelect(
          tokenList,
          DEFAULT_SWAP_TOKENS?.[selectedChain]?.[0]
        );
        setToken1(_token);
      }

      if (token1Query) {
        const _token = getTokenToSelect(tokenList, token1Query);

        if (!_token || !_token.symbol) {
          importToken(token1Query, account, chainId);
        }

        setToken2(_token);
      } else {
        const _token = getTokenToSelect(
          tokenList,
          DEFAULT_SWAP_TOKENS?.[selectedChain]?.[1]
        );
        setToken2(_token);
      }
    }
    initSelection();
  }, [chainId, isActive, tokenList]);

  // clear input values entered
  const clearInputState = () => {
    setToken1Value("");
    setToken2Value("");
  };

  // token 1 input change
  const onToken1InputChange = async (tokens) => {
    setToken1Value(tokens);

    let _swapFn = swapFnConstants.swapExactETHForTokens;
    if (selectedToken0.symbol === NATIVE_TOKEN?.[chainId]) {
      _swapFn = swapFnConstants.swapExactETHForTokens;
    } else if (
      selectedToken1.symbol &&
      selectedToken1.symbol === NATIVE_TOKEN?.[chainId]
    ) {
      _swapFn = swapFnConstants.swapExactTokensForETH;
    } else {
      _swapFn = swapFnConstants.swapExactTokensForTokens;
    }

    setCurrentSwapFn({
      tradeType: swapFnConstants.swapExactIn,
      swapFn: _swapFn,
    });
  };

  // token2 input change
  const onToken2InputChange = async (tokens) => {
    setToken2Value(tokens);

    let _swapFn = swapFnConstants.swapETHforExactTokens;
    if (selectedToken0.symbol === NATIVE_TOKEN?.[chainId]) {
      _swapFn = swapFnConstants.swapETHforExactTokens;
    } else if (
      selectedToken1.symbol &&
      selectedToken1.symbol === NATIVE_TOKEN?.[chainId]
    ) {
      _swapFn = swapFnConstants.swapTokensForExactETH;
    } else {
      _swapFn = swapFnConstants.swapTokensForExactTokens;
    }

    setCurrentSwapFn({
      tradeType: swapFnConstants.swapExactOut,
      swapFn: _swapFn,
    });
  };

  // parseed input token amounts entered by user: token0/token1 to pass into best trade hooks
  const parsedToken0Amount = useMemo(() => {
    if (!token1Value || !selectedToken0.symbol || !chainId) {
      return undefined;
    }

    const _token = new Token(
      chainId,
      isAddress(selectedToken0.address),
      selectedToken0.decimals,
      selectedToken0.symbol,
      selectedToken0.name
    );

    return new TokenAmount(
      _token,
      JSBI.BigInt(toWei(token1Value, selectedToken0.decimals))
    );
  }, [token1Value, selectedToken0, chainId]);

  const parsedToken1Amount = useMemo(() => {
    if (!token2Value || !selectedToken1.symbol || !chainId) {
      return undefined;
    }

    const _token = new Token(
      chainId,
      isAddress(selectedToken1.address),
      selectedToken1.decimals,
      selectedToken1.symbol,
      selectedToken1.name
    );

    return new TokenAmount(
      _token,
      JSBI.BigInt(toWei(token2Value, selectedToken1.decimals))
    );
  }, [token2Value, selectedToken1, chainId]);
  //

  // parsed tokens in wrappedCurency format to be used as output asset
  const wrappedCurrency0 = useMemo(() => {
    if (!selectedToken0.address || !chainId) {
      return undefined;
    }

    const _token = new Token(
      chainId,
      isAddress(selectedToken0?.address),
      selectedToken0.decimals,
      selectedToken0.symbol,
      selectedToken0.name
    );

    return wrappedCurrency(_token, chainId);
  }, [selectedToken0, chainId]);

  const wrappedCurrency1 = useMemo(() => {
    if (!selectedToken1.address || !chainId) {
      return undefined;
    }

    const _token = new Token(
      chainId,
      isAddress(selectedToken1?.address),
      selectedToken1.decimals,
      selectedToken1.symbol,
      selectedToken1.name
    );

    return wrappedCurrency(_token, chainId);
  }, [selectedToken1, chainId]);

  // trade hooks
  const bestTradeExactIn = useTradeExactIn(
    parsedToken0Amount,
    wrappedCurrency1
  );

  const bestTradeExactOut = useTradeExactOut(
    wrappedCurrency0,
    parsedToken1Amount
  );
  //

  const tradePriceImpact = useMemo(() => {
    if (currentSwap.tradeType === swapFnConstants.swapExactIn) {
      const { priceImpactWithoutFee } = computeTradePriceBreakdown(
        bestTradeExactIn && bestTradeExactIn
      );
      return priceImpactWithoutFee?.toSignificant(6);
    }

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(
      bestTradeExactOut && bestTradeExactOut
    );

    return priceImpactWithoutFee?.toSignificant(6);
  }, [bestTradeExactIn, bestTradeExactOut, currentSwap]);

  const currentTradePath = useMemo(() => {
    if (currentSwap.tradeType === swapFnConstants.swapExactIn) {
      return bestTradeExactIn?.route?.path?.map((_token) => _token.address);
    }

    return bestTradeExactOut?.route?.path?.map((_token) => _token.address);
  }, [bestTradeExactIn, bestTradeExactOut, currentSwap]);

  // token usd price tracker start
  const token0PriceData = useTokenData(
    selectedToken0.address ? selectedToken0.address.toLowerCase() : null
  );
  const token1PriceData = useTokenData(
    selectedToken1.address ? selectedToken1.address.toLowerCase() : null
  );

  const token0PriceUsd = useMemo(() => {
    if (!selectedToken0?.symbol || !token0PriceData) {
      return 0;
    }

    return token0PriceData?.priceUSD;
  }, [token0PriceData]);

  const token1PriceUsd = useMemo(() => {
    if (!selectedToken1?.symbol || !token1PriceData) {
      return 0;
    }

    return token1PriceData?.priceUSD;
  }, [token1PriceData]);
  // end token usd price tracker

  const onToken1Select = async (token) => {
    setToken1(token);
  };

  const onToken2Select = (token) => {
    setToken2(token);
  };

  const handleSettings = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };
  const { confirmAllowance, allowance } = useTokenAllowance(
    selectedToken0,
    account,
    ROUTER_ADDRESS?.[chainId]
  );

  const handleConfirmAllowance = async () => {
    const _allowanceAmount =
      selectedToken0?.address?.toLowerCase() ===
      TOKEN_ADDRESS?.CORGIB?.[chainId]?.toLowerCase()
        ? corgibAllowance
        : allowanceAmount;
    await confirmAllowance(_allowanceAmount);
  };

  const handleSwapToken = () => {
    setSwapDialog(true);
  };

  // swap selected tokens and reset inputs
  const handleSwapInputs = () => {
    setRotate(!rotate);
    const tokenSelected1 = selectedToken0;
    setToken1(selectedToken1);
    setToken2(tokenSelected1);
  };

  const handleAction = () => {
    if (!isActive) {
      if (isMetaMaskInstalled()) {
        connectWallet(CONNECTOR_TYPE.injected);
      } else {
        connectWallet(CONNECTOR_TYPE.walletConnect);
      }
      return;
    }

    if (
      ["swap", "token_approve"].includes(transaction.type) &&
      transaction.status === TransactionStatus.PENDING &&
      !swapDialogOpen
    ) {
      setSwapDialog(true);
      return;
    }

    if (allowance) {
      handleSwapToken();
    } else {
      setSwapDialog(true);
      handleConfirmAllowance();
    }
  };

  // swap transaction status update
  useEffect(() => {
    if (!transaction.hash && !transaction.type) {
      return;
    }

    if (
      ["swap", "token_approve"].includes(transaction.type) &&
      transaction.status === TransactionStatus.COMPLETED
    ) {
      localStorage.priceTracker = "None";
    }

    if (
      ["swap", "token_approve"].includes(transaction.type) &&
      (transaction.status === TransactionStatus.COMPLETED ||
        transaction.status === TransactionStatus.COMPLETED) &&
      !swapDialogOpen
    ) {
      setSwapDialog(true);
    }
  }, [transaction]);

  const handleConfirmSwapClose = (value) => {
    setSwapDialog(value);

    if (
      ["swap", "token_approve"].includes(transaction.type) &&
      transaction.status === TransactionStatus.COMPLETED
    ) {
      store.dispatch({ type: START_TRANSACTION });
      // clearInputState();
    } else if (
      ["swap", "token_approve"].includes(transaction.type) &&
      transaction.status === TransactionStatus.FAILED
    ) {
      store.dispatch({ type: START_TRANSACTION });
    }
  };

  const parsedToken1Value = useMemo(() => {
    return currentSwap.tradeType === swapFnConstants.swapExactIn
      ? token1Value
      : token2Value
      ? bestTradeExactOut?.inputAmount.toSignificant(6)
      : "";
  }, [
    bestTradeExactOut,
    bestTradeExactIn,
    token1Value,
    token2Value,
    currentSwap.tradeType,
  ]);

  const parsedToken2Value = useMemo(() => {
    return currentSwap.tradeType === swapFnConstants.swapExactIn
      ? token1Value
        ? bestTradeExactIn?.outputAmount.toSignificant(6)
        : ""
      : token2Value;
  }, [
    bestTradeExactIn,
    bestTradeExactOut,
    token1Value,
    token2Value,
    currentSwap.tradeType,
  ]);

  const route = useMemo(() => {
    if (currentSwap.tradeType === swapFnConstants.swapExactIn) {
      return bestTradeExactIn && bestTradeExactIn?.route;
    }
    return bestTradeExactOut && bestTradeExactOut?.route;
  }, [bestTradeExactIn, bestTradeExactOut, currentSwap]);

  const userHasSpecifiedInputOutput = useMemo(() => {
    return Boolean(
      selectedToken0.address &&
        selectedToken1.address &&
        (new BigNumber(token1Value).gt(0) || new BigNumber(token2Value).gt(0))
    );
  }, [selectedToken0, selectedToken1, token1Value, token2Value]);
  const noRoute = !route;

  const priceRatio = useMemo(() => {
    return getPriceRatio(parsedToken2Value, parsedToken1Value);
  }, [parsedToken1Value, parsedToken2Value]);

  const currencyBalances = useCurrencyBalances(account, [
    wrappedCurrency0,
    wrappedCurrency1,
  ]);

  const currentSwapStatus = useMemo(() => {
    const canSwap = () => {
      if (whitelist.length === 0) {
        return true;
      }
      return whitelist
        .map((addr) => addr.toLowerCase())
        .includes(account.toLowerCase());
    };

    if (!isActive) {
      return { currentBtnText: "Connect Wallet", disabled: false };
    }
    if (isActive && !canSwap()) {
      return { currentBtnText: "Wallet not whitelisted", disabled: true };
    }
    if (
      ["swap", "token_approve"].includes(transaction.type) &&
      transaction.status === TransactionStatus.PENDING
    ) {
      return { currentBtnText: "Pending Transaction...", disabled: false };
    }

    if (!userHasSpecifiedInputOutput) {
      return { currentBtnText: "Enter token amount", disabled: true };
    }

    if (noRoute && userHasSpecifiedInputOutput) {
      return {
        currentBtnText: "Insufficient liquidity for this trade!",
        disabled: true,
      };
    }

    const bal0 = !currencyBalances?.[0]
      ? "0"
      : currencyBalances?.[0]?.toExact();

    if (new BigNumber(parsedToken1Value).gt(bal0)) {
      return { currentBtnText: "Insufficient funds!", disabled: true };
    }

    if (!allowance) {
      return {
        currentBtnText: "Approve " + selectedToken0?.symbol,
        disabled: false,
      };
    }

    return { currentBtnText: "Swap", disabled: false };
  }, [
    isActive,
    transaction.type,
    transaction.status,
    userHasSpecifiedInputOutput,
    noRoute,
    currencyBalances,
    parsedToken1Value,
    allowance,
    account,
    selectedToken0?.symbol,
  ]);

  return (
    <>
      <TabPage data={0} />

      <TransactionConfirm
        open={swapDialogOpen}
        handleClose={() => handleConfirmSwapClose(false)}
        selectedToken0={selectedToken0}
        selectedToken1={selectedToken1}
        token1Value={parsedToken1Value}
        token2Value={parsedToken2Value}
        priceImpact={tradePriceImpact}
        currentSwapFn={currentSwap.swapFn}
        currenSwapPath={currentTradePath}
        priceRatio={priceRatio}
        chainId={chainId}
        currentAccount={account}
      />
      <SwapSettings open={settingOpen} handleClose={close} />

      <Card elevation={20} className={classes.card}>
        <div className={classes.cardContents}>
          <div className={classes.cardHeading}>
            <h6 className={classes.heading}>Swap </h6>
            {/* <IconButton className={classes.iconButton}>
              <Settings
                fontSize="default"
                onClick={handleSettings}
                className={classes.settingIcon}
              />
            </IconButton> */}
          </div>

          <SwapCardItem
            inputType="from"
            onInputChange={onToken1InputChange}
            onTokenChange={onToken1Select}
            currentToken={selectedToken0}
            disableToken={selectedToken1}
            inputValue={parsedToken1Value}
            priceUSD={token0PriceUsd}
            currenryBalance={currencyBalances?.[0]?.toExact()}
          />

          <IconButton className={classes.iconButton}>
            {" "}
            <SwapVertIcon
              fontSize="default"
              className={[
                classes.swapIcon,
                rotate ? classes.rotate1 : classes.rotate2,
              ].join(" ")}
              onClick={handleSwapInputs}
            />
          </IconButton>
          <SwapCardItem
            inputType="to"
            onInputChange={onToken2InputChange}
            onTokenChange={onToken2Select}
            currentToken={selectedToken1}
            disableToken={selectedToken0}
            inputValue={parsedToken2Value}
            priceUSD={token1PriceUsd}
            currenryBalance={currencyBalances?.[1]?.toExact()}
          />

          {parsedToken1Value && parsedToken2Value && (
            <div
              className="mt-2 d-flex justify-content-end"
              style={{ width: "95%" }}
            >
              <div className={classes.tokenPrice} style={{ color: "white" }}>
                {selectedToken0.symbol &&
                selectedToken1.symbol &&
                !currentSwapStatus.disabled ? (
                  <span style={{ paddingRight: 5, color: "white" }}>
                    1 {selectedToken0.symbol} {" = "}
                    <NumberFormat
                      displayType="text"
                      value={priceRatio}
                      decimalScale={5}
                    />{" "}
                    {selectedToken1.symbol}
                  </span>
                ) : (
                  ""
                )}

                <Info
                  className={classes.infoIcon}
                  style={{ marginTop: -3, color: "#fff !important" }}
                  onClick={handleTxPoper}
                  onMouseEnter={handleTxPoper}
                  onMouseLeave={() => setAnchorEl(null)}
                />
              </div>
            </div>
          )}
        </div>

        <Popper id={id} open={open} anchorEl={anchorEl}>
          <div className={classes.txDetailsCard}>
            <h6 className={classes.txDetailsValue}>
              For each trade a 0.2% fee is paid
            </h6>

            <div className="mt-2">
              <div className={classes.txDetailsValue}>
                - 80% to LP token holders
              </div>
              <div className={classes.txDetailsValue}>
                - 20% to the Treasury, for buyback {FARM_TOKEN?.[1]} and burn
              </div>
            </div>
          </div>
        </Popper>
      </Card>

      <Card elevation={20} className={classes.cardOverall}>
        <Button
          className={classes.advancedButton}
          style={{ color: "white" }}
          onClick={handleSettings}
        >
          <div
            onClick={handleSettings}
            className={classes.centerItems}
            style={{
              cursor: "pointer",
              width: "80%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p style={{ margin: 0, marginRight: 10 }}>Advanced Options</p>
            <Settings
              fontSize="default"
              onClick={handleSettings}
              style={{ color: "#3d5afe" }}
              className={classes.settingIcon}
            />
          </div>
        </Button>

        <Button
          disabled={currentSwapStatus.disabled}
          className={classes.swapButton}
          style={{ color: "white" }}
          onClick={handleAction}
        >
          {currentSwapStatus.currentBtnText}
        </Button>
      </Card>
    </>
  );
};

const mapStateToProps = (state) => ({
  account: state.account,
  dex: state.dex,
});

export default connect(mapStateToProps, {
  importToken,
})(Swap);
