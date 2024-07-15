import IBlockchainRPC from "../rpc";
import axios from "axios";
import { GetBalanceResponse } from "./model/GetBalanceResponse";

class TonRPC implements IBlockchainRPC {
    
    private baseUrl = 'https://go.getblock.io/';

    async getBalance(address: string): Promise<Number> {
        const { data, status } = await axios.get<GetBalanceResponse>(
            this.baseUrl.concat(process.env.TON_KEY).concat("/getAddressBalance?address=").concat(address),
        );
        if (status === 200) {
            return parseInt(data.result) / Math.pow(10, 9);
        }
    }

    async validateAddress(address: string): Promise<Boolean> {
        const { data, status } = await axios.get<GetBalanceResponse>(
            this.baseUrl.concat(process.env.TON_KEY).concat("/detectAddress?address=").concat(address),
        );
        return data.ok
    }

}

const tonRPCClient = new TonRPC();

export default tonRPCClient;
