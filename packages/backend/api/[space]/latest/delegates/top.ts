// retun top delegates for a given snapshot space.
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { db } from "../../../../lib/services/storage/db"
import { handleCors } from "../../../../lib/corsHandler"

const { count, sum } = db.fn

export default async function getTopDelegates(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (handleCors(request, response)) return

  const space = request.query.space as string
  let orderBy
  if (request.query.by === "weight") {
    orderBy = "delegated_amount"
  } else if (request.query.by === "count") {
    orderBy = "number_of_delegations"
  } else {
    throw new Error("Error: invalid 'by' parameter.")
  }

  const limit = Number(request.query.limit) || 100
  const offset = Number(request.query.offset) || 0

  let topDelegates
  topDelegates = await db
    .selectFrom("delegation_snapshot")
    .where("context", "=", space)
    .where("main_chain_block_number", "is", null)
    .groupBy("to_address")
    .select(["to_address", count("to_address").as("number_of_delegations")])
    .select(["to_address", sum("delegated_amount").as("delegated_amount")])
    .orderBy(orderBy, "desc")
    .limit(limit)
    .offset(offset)
    .execute()

  if (topDelegates.length === 0) {
    console.log("No delegations found for space context", space)
  }

  response.status(200).json({
    success: "true",
    topDelegates,
  })
}
