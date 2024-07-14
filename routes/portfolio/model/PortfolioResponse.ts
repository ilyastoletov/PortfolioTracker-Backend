export type PortfolioResponse = {
    currencies: Currency[],
    net_worth_usd: Number,
    net_worth_btc: Number
};

export type Currency = {
    name: String,
    cur_price: Number,
    balance: Number,
    balance_usd: Number
};