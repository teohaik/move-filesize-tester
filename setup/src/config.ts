import { config } from "dotenv";
import * as process from "process";

config({});
export const SUI_NETWORK = process.env.SUI_NETWORK!;
export const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS!;

export const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export const PARTNER_ADDRESS = ADMIN_ADDRESS;

export const USER_SECRET_KEY = process.env.BJ_PLAYER_SECRET_KEY!;

export const PUBLISHER_ID = process.env.PUBLISHER_ID!;
export const PACKAGE_ADDRESS = process.env.PACKAGE_ADDRESS!;

export const ADMIN_CAP_ID = process.env.ADMIN_CAP_ID!;
export const WHITELIST_ID = process.env.WHITELIST_ID!;
export const GET_OBJECT_TYPE = `${PACKAGE_ADDRESS}::getlabs::Get`;

export const TRANSFER_POLICY_ID = process.env.TRANSFER_POLICY_ID!;
export const TRANSFER_POLICY_CAP_ID = process.env.TRANSFER_POLICY_CAP_ID!;



// console.log everything in the process.env object
const keys = Object.keys(process.env);
console.log("env contains ADMIN_ADDRESS:", keys.includes("ADMIN_ADDRESS"));
console.log("env contains USER_SECRET_KEY:", keys.includes("BJ_PLAYER_SECRET_KEY"));
