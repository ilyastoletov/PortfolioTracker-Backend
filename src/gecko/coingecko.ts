import axios from "axios";
import { CoinInfoResponse } from "./model/CoinInfoResponse";
import { CoinMarketInfoResponse } from "./model/CoinMarketInfoResponse";

class CoinGeckoClient {

    private baseUrl = "https://api.coingecko.com/api/v3/"

    async getCurrentPriceUSD(network: string): Promise<Number> {
        const lowercasedNetwork = network.toLowerCase();
        const { data, status } = await axios.get<CoinMarketInfoResponse>(
            this.baseUrl.concat("simple/price/").concat(`?ids=${lowercasedNetwork}&vs_currencies=usd`),
            {
                headers: {
                    "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
                }
            }
        );
        return data[lowercasedNetwork].usd;
    }

    async isNetworkAvailable(network: string): Promise<Boolean> {
        const { data, status } = await axios.get<CoinInfoResponse[]>(
            this.baseUrl.concat("coins/list"),
            {
                headers: {
                    "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
                }
            }
        );
        const foundNetwork = data.find((v) => { v.name == network });
        return (typeof foundNetwork != undefined);
    }

}

const geckoClient = new CoinGeckoClient();

export default geckoClient;
