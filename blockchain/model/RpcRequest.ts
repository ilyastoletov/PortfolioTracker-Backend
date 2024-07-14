export type RpcRequest = {
    jsonrpc: string,
    method: string,
    params: string[],
    id: string
}