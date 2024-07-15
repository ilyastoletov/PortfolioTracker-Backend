import ethereumRPC from "./eth/ethereum";
import tonRPCClient from "./ton/ton";

/*
You can add more RPC-supporting chains by implementing IBlockchainRPC interface,
specifying getblock.io RPC key in your .env, also you need to add desired
network to supportedNetworks array.
*/

export const supportedNetworks = ['Ethereum', 'Toncoin'];

export default interface IBlockchainRPC {
    getBalance(address: String): Promise<Number>;
    validateAddress(address: String): Promise<Boolean>;
}

export function getRpcInstance(network_name: string): IBlockchainRPC {
    switch (network_name) {
        case "Ethereum":
            return ethereumRPC;
        case "Toncoin":
            return tonRPCClient;
    }
}