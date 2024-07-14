# Portfolio Tracker Backend

This repository contains server logic for Portfolio Tracker arduino device (see PortfolioTracker-Arduino). You should use this backend with telegram bot (see PortfolioTracker-Bot) as an admin client (to add accounts and transactions) or without by just calling endpoints as you need.

Startup:
```
npm install
npm start
```

## Brief docs

GET /portfolio <br>
Get portfolio information
Response:
```
{
	 "currencies": [
		 {
			 "name": str,
			 "cur_price": number,
			 "portfolio_quantity": number,
			 "portfolio_value": number
		 },
		 ...
	 ],
	 "net_worth": number,
	 "net_worth_btc": number
 }
```

POST /account/add <br>
To create an account
Request body:
```
{
  "network_name": string, - Name of network (e.g "Bitcoin")
  "address": string?, - Address of account in certain network. Supply this parameter only if network is supported by RPC
  "balance": number - Initial balance
}
```

GET /account/all <br>
Get list of all accounts

GET /account/byName/:name <br>
Get account by network name. Supply name as path parameter

DELETE /account/:name <br>

POST /transaction/add <br>
Request body:
```
{
  "account": string,
  "amount": number,
  "increase": boolean - Whether the balance value should be increased
}
```

GET /transaction/all <br>
Get list of all transactions for all accounts

GET /transaction/byNetwork/:networkName <br>
Get all transactions by certain network name

