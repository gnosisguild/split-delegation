// /api/v1/safe.ggtest.eth/latest/delegates/top

// response {
//   delegates: [
//     {
//       address: "0x",
//       delegatorCount: 0,
//       percentOfDelegatesBPS: 0,
//       percentOfVotesBPS: 0,
//       votingPower: 0
//     }
//   ]
// }

// should support query params:
// - limit: number
// - offset: number
// - by: 'weight' | 'count'

type TopResponse = {
  delegates: DelegateResponse[]
}

type DelegateResponse = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  percentOfVotes: number
  votingPower: number
}

export const GET = async (
  req: NextApiRequest,
  res: NextApiResponse<TopResponse>
) => {}
