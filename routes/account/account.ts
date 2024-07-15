import { Router, Request, Response } from "express";
import { isCreateAccountRequest } from "./model/CreateAccountRequest";
import models from '../../src/mongo/mongo';
import { supportedNetworks } from "../../src/blockchain/rpc";
import IBlockchainRPC, { getRpcInstance } from "../../src/blockchain/rpc";
import geckoClient from "../../src/gecko/coingecko";
import * as asyncWrapper from "express-async-handler";
import { EditAddressRequest, isEditAddressRequest } from "./model/EditAddressRequest";

export const accountRouter = Router();

accountRouter.post("/account/add", asyncWrapper(async (req: Request, res: Response) => {
    if (!isCreateAccountRequest(req.body)) {
        res.status(400).send({ error: "Invalid request" });
        return;
    }

    if (!await isNetworkSupported(req.body.network_name)) {
        res.status(400).send({ error: "Network is not supported" });
        return;
    }

    const address = req.body.address;
    if (address != null) {
        if (!isNetworkSupportedForTracking(req.body.network_name)) {
            res.status(400).send({ error: "Supplied network is not supported for address balance tracking yet." });
            return;
        }
        if (!await isAddressValid(req.body.network_name, req.body.address)) {
            res.status(400).send({ error: "Supplied address is not valid" });
            return;
        }
    }
    const account = new models.Account(req.body);
    account.save();
    res.status(201).send(account);
}));

async function isNetworkSupported(name: string): Promise<Boolean> {
    return geckoClient.isNetworkAvailable(name);
}

function isNetworkSupportedForTracking(name: string): boolean {
    return supportedNetworks.indexOf(name) >= 0;
}

async function isAddressValid(network: string, address: string): Promise<Boolean> { 
    const rpcInstance: IBlockchainRPC = getRpcInstance(network);
    const isAddressValid = await rpcInstance.validateAddress(address);
    return isAddressValid; 
}

accountRouter.get("/account/availableNetworks", (req, res) => {
    const availableNetworks = ["Bitcoin", "Ethereum", "Solana", "Toncoin", "Avalanche", "Tether USD", "BNB", "XRP", "TRON", "Monero"]
    res.status(200).send(availableNetworks);
});

accountRouter.patch("/account/editAddress", asyncWrapper(async (req, res) => {
    if (!isEditAddressRequest(req.query)) {
        res.status(400).send({ error: "Specify all required query parameters" });
        return;
    }
    const account = await models.Account.findOne({ network_name: req.query.account });
    if (account.address === undefined) {
        res.status(400).send({ error: "This account has no address" });
        return;
    }
    if (!await isAddressValid(String(req.query.account), String(req.query.newAddress))) {
        res.status(400).send({ error: "New address is not valid" });
        return;
    }
    await account.updateOne({ address: req.query.newAddress });
    res.status(200).send({});
}));

accountRouter.get("/account/all", asyncWrapper(async (_, res) => {
    const allAccounts = await models.Account.find({});
    res.status(200).send(allAccounts);
}));

accountRouter.get("/account/byName/:name", asyncWrapper(async (req, res) => {
    const account = await models.Account.findOne({ network_name: req.params.name });
    res.status(200).send(account);
}));

accountRouter.delete("/account/:networkName", asyncWrapper(async (req, res) => {
    const account = await models.Account.findOne({ network_name: req.params.networkName });
    await models.Account.deleteOne({ network_name: req.params.networkName });
    await models.Transaction.deleteMany({ account: req.params.networkName });
    res.status(200).send(account);
}));