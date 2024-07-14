declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URI: string;
        COINGECKO_KEY: string;
        ETH_KEY: string;
        // Add more GetBlock RPC keys here as needed
    }
}