import {connect} from "nats";

export const ACTION_SET = "set";
export const ACTION_CLEAR = "clear";
export const ACTION_EXPIRE = "expire";

export type DelegationDetails = {
    address: string;
    weight: number;
}

export type Delegations = {
    details: DelegationDetails[];
    expiration: number;
}

export type DelegateEvent = {
    action: string;
    address_from: string;
    original_space_id: string;
    chain_id: string;
    block_number: number;
    block_timestamp: number;
    delegations: Delegations;
}

// todo: how to reconnect on error
export function sendToNats(events: DelegateEvent[]) {
    if (events.length == 0) {
        return
    }

    console.info(
        `Sending ${events.length} evens to nats subject...`
    )

    const subject = process.env.NATS_SUBJECT || "aggregator.delegate.updated";
    connect({servers: process.env.NATS_CONNECT || "127.0.0.1:4222"})
        .then(nc => {
            for (const event of events) {
                nc.publish(subject, JSON.stringify(event))
            }

            nc.drain().finally(() => console.log("nats connection was closed"))
        })
}
