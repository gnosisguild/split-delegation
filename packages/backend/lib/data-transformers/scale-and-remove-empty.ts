import R from "ramda"
import { DelegateToDelegatorToValue, DelegateToValue } from "../../types"

export const convertDelegatedVoteWeight = (
  delegateToVoteWeight: DelegateToValue = {},
): DelegateToValue<string> =>
  (R.map as any)(
    (value: number) => value.toFixed(18).replace(".", ""),
    R.pickBy((val: number) => val > 0, delegateToVoteWeight),
  ) as DelegateToValue<string>

export const convertDelegatedVoteWeightByAccount = (
  delegatedVoteWeightByAccount: DelegateToDelegatorToValue = {},
): DelegateToDelegatorToValue<string> =>
  (R.compose as any)(
    R.pickBy(
      (delegate: { [delegatorAddress: string]: number }) =>
        R.keys(delegate).length > 0, // if delegate has delegators we keep it
    ),
    R.map((delegate: { [delegatorAddress: string]: number }) =>
      // for each delegate
      R.compose(
        R.map((value: number) => value.toFixed(18).replace(".", "")),
        // for each delegator
        R.pickBy((val: number) => val > 0),
      )(delegate),
    ),
  )(delegatedVoteWeightByAccount as any)