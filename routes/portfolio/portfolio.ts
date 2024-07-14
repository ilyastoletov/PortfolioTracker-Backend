import { Router } from "express";
import * as asyncWrapper from 'express-async-handler';
import { Currency, PortfolioResponse } from './model/PortfolioResponse';
import models from "../../mongo/mongo";
import geckoClient from "../../gecko/coingecko";
import { getRpcInstance } from "../../blockchain/rpc";

export const portfolioRouter = Router();

portfolioRouter.get("/portfolio", asyncWrapper(async (req, res) => {
    const prices = await getPricesUsd();
    const currencies = await getCurrencies(prices);
    const netWorthUSD = await calculateNetWorthUSD(prices);
    const netWorthBTC = await calculateNetWorthBTC(netWorthUSD);

    const response: PortfolioResponse = {
        currencies: currencies,
        net_worth_usd: netWorthUSD,
        net_worth_btc: netWorthBTC
    };

    res.status(200).send(response);
}));

async function getPricesUsd(): Promise<Number[]> {
    const prices: number[] = [];
    const accounts = await models.Account.find({});
    for (const account of accounts) {
        const priceUSD = await geckoClient.getCurrentPriceUSD(account.network_name);
        prices.push(priceUSD as number);
    }
    return prices;
}

async function getCurrencies(pricesUSD: Number[]): Promise<Currency[]> {
    const accounts = await models.Account.find({});
    const currencies: Currency[] = [];
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const priceUSD = pricesUSD[i];
        const balance = await getAccountBalance(account.network_name, account.balance, account.address);
        const balanceUSD = (balance as number) * (priceUSD as number);
        const formattedBalanceUSD = Number(balanceUSD.toFixed(2));
        currencies.push(
            {
                name: account.network_name,
                cur_price: priceUSD,
                balance: balance,
                balance_usd: formattedBalanceUSD
            }
        );
    }
    return currencies;
}

async function getAccountBalance(network_name: string, acc_balance: number, address: string): Promise<Number> {
    let balance: Number;
    if (address == null) {
        balance = acc_balance;
    } else {
        balance = await getBalanceRPC(network_name, address);
    }
    return balance;
}

async function getBalanceRPC(network_name: string, address: string): Promise<Number> {
    const rpcClient = getRpcInstance(network_name);
    const balance = await rpcClient.getBalance(address);
    return balance;
}

async function calculateNetWorthUSD(prices: Number[]): Promise<Number> {
    const accounts = await models.Account.find({});
    let worth: number = 0;
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const priceUSD = prices[i] as number;
        const balance = await getAccountBalance(account.network_name, account.balance, account.address) as number;
        worth += (balance * priceUSD);
    }
    return Number(worth.toFixed(2));
}

async function calculateNetWorthBTC(worthUSD: Number): Promise<Number> {
    const btcPriceUSD = await geckoClient.getCurrentPriceUSD("Bitcoin") as number;
    const worth = (worthUSD as number) / btcPriceUSD
    return Number(worth.toFixed(9));
}