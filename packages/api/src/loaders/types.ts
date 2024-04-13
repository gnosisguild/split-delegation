export type RpcFetch<T> = (fromBlock: number, toBlock: number) => Promise<T[]>
