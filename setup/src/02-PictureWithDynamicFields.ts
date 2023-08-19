import {Connection, Ed25519Keypair, fromB64, JsonRpcProvider, RawSigner, TransactionBlock} from "@mysten/sui.js";

import {
    PACKAGE_ADDRESS,
    ADMIN_SECRET_KEY,
    PARTNER_ADDRESS,
    PUBLISHER_ID,
    SUI_NETWORK, USER_SECRET_KEY, ADMIN_CAP_ID
} from "./config";
import fs from "fs";
import * as path from "path";

console.log("Connecting to SUI network: ", SUI_NETWORK);

const secretKey = ADMIN_SECRET_KEY;
let privateKeyArray = Uint8Array.from(Array.from(fromB64(secretKey!)));

const keypair = Ed25519Keypair.fromSecretKey(privateKeyArray.slice(1));

const address = keypair.getPublicKey().toSuiAddress();

const connection = new Connection({
    fullnode: SUI_NETWORK,
});
const provider = new JsonRpcProvider(connection);

const signer = new RawSigner(keypair, provider);


const readImageToBytes = (imgPath:any) => {
    // read image file
    let buffer = fs.readFileSync(imgPath, );
    console.log("File size: ", buffer.length);
    return buffer;
}

const mintPicAndUploadData = async () => {
    const tx = new TransactionBlock();

    tx.setGasBudget(1000000000);


    const picture = tx.moveCall({
        target: `${PACKAGE_ADDRESS}::filesize::mint_picture_empty`,
        arguments: [
            tx.pure("This is a picture")
        ],
    });

    tx.transferObjects([picture], tx.pure(address));

    signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        requestType: "WaitForLocalExecution",
        options: {
            showEvents: true,
            showEffects: true,
            showObjectChanges: true,
            showBalanceChanges: true,
            showInput: true
        }

    }).then(res => {
        const status = res?.effects?.status.status;

        if (status === "success") {

            res?.objectChanges?.find((obj) => {
                if (obj.type === "created" && obj.objectType.endsWith("filesize::Picture")) {
                    const objIdString = obj.objectId;
                    console.log("\r \n Image Object Created!  ID = ", objIdString);

                    updatePicDataWithDynamicField(obj.objectId);
                }
            });

        }
        if (status == "failure") {
            console.log("Error = ", res?.effects);
            process.exit(1);
        }

    }).catch(error => {
        console.log(error);
    });

}



const updatePicDataWithDynamicField = async (picId : string) => {

    console.log("\r\n Uploading more bytes for picture ID = ", picId);

    const step = 16380;
    let startByte= 0;
    let endByte = startByte + step;

    const imageData = readImageToBytes("./rb-test.jpg");

    let i= 1;
    while (endByte < imageData.length) {

        if(endByte > imageData.length) {
            endByte = imageData.length;
        }

        const tx = new TransactionBlock();
        tx.setGasBudget(1000000000);

        tx.moveCall({
            target: `${PACKAGE_ADDRESS}::filesize::add_bytes_as_dof`,
            arguments: [
                tx.object(picId),
                tx.pure(i, "u8"),
                tx.pure(Array.from(imageData.slice(startByte, endByte)), "vector<u8>"),
            ],
        });

        const res = await signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            requestType: "WaitForLocalExecution",
            options: {
                showEffects: true,
                showObjectChanges: true,
            }

        }).catch(error => {
            console.log(error);
        });

        const status = res?.effects?.status.status;

        if (status === "success") {
            console.log("Round ",i," executed! status = ", status,"  | Start byte = ", startByte," end Byte = ", endByte);
        }
        if (status === "failure") {
            console.log("Round ",i," failed! status = ", status," Reason = ", res?.effects?.status.error);
            process.exit(1);
        }

        i++;
        startByte = endByte + 1;
        endByte = startByte + step;
    }


}

 mintPicAndUploadData();


