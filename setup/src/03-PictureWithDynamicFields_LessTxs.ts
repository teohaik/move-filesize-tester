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

const PTB_MAX_SIZE = 130000;

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



    let endByte = await updatePicData(0, picId);

    // while (endByte <= 1025742) {
    //     endByte = await updatePicData(endByte+1 ,picId);
    // }

}



const updatePicData = async (initStartByte: number = 0, picId : string) => {

    console.log("\r\n Uploading more bytes for picture ID = ", picId);

    const tx = new TransactionBlock();
    tx.setGasBudget(1000000000);

    const step = 16380;
    let startByte = initStartByte;
    let endByte = startByte + step;
    let total = 0;
    const imageData = readImageToBytes("./rb-test.jpg");

    let i= 1;
    while (endByte < imageData.length && total <= PTB_MAX_SIZE-step) {

        if(endByte > imageData.length) {
            endByte = imageData.length;
        }

        tx.moveCall({
            target: `${PACKAGE_ADDRESS}::filesize::add_bytes_as_dof`,
            arguments: [
                tx.object(picId),
                tx.pure(i, "u8"),
                tx.pure(Array.from(imageData.slice(startByte, endByte)), "vector<u8>"),
            ],
        });

        i++;
        startByte = endByte + 1;
        endByte = startByte + step;
        total += endByte - startByte;
        console.log("Current total ",total,"  | Start byte = ", startByte," end Byte = ", endByte);
    }

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
        console.log("Round until byte ",endByte," executed!   | Start byte = ", initStartByte," end Byte = ", endByte);
    }
    if (status === "failure") {
        console.log("Round ",endByte," failed!  Reason = ", res?.effects?.status.error);
        process.exit(1);
    }

    return endByte;

}

 mintPicAndUploadData();


