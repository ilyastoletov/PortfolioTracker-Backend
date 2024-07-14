import { isAddress } from "web3-validator";
import IBlockchainRPC from "../rpc";
import axios from "axios";
import { GetBalanceResponse } from "./model/GetBalanceResponse";
import { RpcRequest } from "../model/RpcRequest";

class EthereumRPC implements IBlockchainRPC {

    private requestBalanceBody = (address: String): RpcRequest => {
        return {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [
                address as string, "latest"
            ],
            id: "getblock.io"
        }
    };

    async getBalance(address: String): Promise<Number> {
        const rpcUrl = `https://go.getblock.io/${ process.env.ETH_KEY }/`;
        const { data, status } = await axios.post<GetBalanceResponse>(
            rpcUrl, JSON.stringify(this.requestBalanceBody(address)),
            {
                headers: {
                    'Content-Type': "application/json"
                }
            }
        )
        if (status == 200) {
            return this.fromHexadecimalToDecimal(data.result);
        }
    }

    async validateAddress(address: String): Promise<Boolean> {
        return isAddress(address as string);
    }

    private fromHexadecimalToDecimal(hexadecimal: string): number {
        const asInt = parseInt(hexadecimal, 16);
        return asInt / Math.pow(10, 18);
    }
}

const ethereumRPC = new EthereumRPC();

export default ethereumRPC;