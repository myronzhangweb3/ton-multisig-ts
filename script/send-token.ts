import {
    Address,
    MessageRelaxed,
    TonClient,
    MultisigWallet,
    MultisigOrder,
    MultisigOrderBuilder, toNano, beginCell,
} from 'ton';
import {Config, getHttpEndpoint} from '@orbs-network/ton-access';
import yargs from 'yargs';
import {getKeyPairs} from "../common/keys";
import {JettonMaster} from "ton/dist/jetton/JettonMaster";

async function main() {
    const argv = await yargs
        .option('network', {
            alias: 'n',
            type: 'string',
            description: 'network',
            demandOption: true,
        })
        .option('jettonMaster', {
            alias: 'jm',
            type: 'string',
            description: 'jetton master address',
            demandOption: true,
        })
        .option('jettonDecimals', {
            alias: 'jd',
            type: 'number',
            description: 'jetton master decimals',
            demandOption: true,
        })
        .option('dest', {
            alias: 'd',
            type: 'string',
            description: 'dest address',
            demandOption: true,
        })
        .option('amount', {
            alias: 'a',
            type: 'number',
            description: 'amount',
            demandOption: true,
        })
        .option('comment', {
            alias: 'c',
            type: 'string',
            description: 'comment with transaction',
            demandOption: false,
        })
        .help()
        .argv;

    let config: Config;
    switch (argv.network) {
        case 'testnet':
            config = {network: 'testnet'}
            break
        default:
            config = {network: 'mainnet'}
            break
    }
    const endpoint = await getHttpEndpoint(config);
    console.log("Endpoint:", endpoint);
    const client = new TonClient({endpoint});

    const keyPairs = await getKeyPairs()
    const walletId = 1;
    let mw: MultisigWallet = new MultisigWallet(
        [keyPairs[0].publicKey, keyPairs[1].publicKey],
        0,
        walletId,
        1,
        {client}
    );
    console.log("wallet address:", mw.address.toString())

    let order1: MultisigOrderBuilder = new MultisigOrderBuilder(walletId);

    const jettonMasterAddress = JettonMaster.create(Address.parse(argv.jettonMaster))
    const contractProvider = client.provider(Address.parse(argv.jettonMaster), null)
    const ownerJettonAddress = await jettonMasterAddress.getWalletAddress(contractProvider, mw.address)
    console.log("ownerJettonAddress:", ownerJettonAddress.toRawString());

    const multipliedValue = parseFloat(argv.amount.toString()) * 10 ** argv.jettonDecimals;

    const body = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(BigInt(Math.round(multipliedValue)))
        .storeAddress(Address.parse(argv.dest))  // destination:MsgAddress
        .storeAddress(mw.address)  // response_destination:MsgAddress
        .storeUint(0, 1)
        .storeCoins(toNano(0.05))
        .storeUint(0, 1)
        .storeUint(0, 32)
        .storeStringTail(argv.comment != null ? argv.comment : "")
        .endCell();

    let msg: MessageRelaxed = {
        body: body,
        info: {
            bounce: true,
            bounced: false,
            createdAt: 0,
            createdLt: 0n,
            dest: ownerJettonAddress,
            forwardFee: 0n,
            ihrDisabled: true,
            ihrFee: 0n,
            type: 'internal',
            value: {coins: toNano("0.1")},
        },
    };

    order1.addMessage(msg, 3);

    let order1b: MultisigOrder = order1.build();
    order1b.sign(0, keyPairs[0].secretKey);
    console.log("order1b:", order1b.signatures);

    let order2: MultisigOrderBuilder = new MultisigOrderBuilder(walletId);
    order2.addMessage(msg, 3);
    let order2b = order2.build();
    order2b.sign(1, keyPairs[1].secretKey);
    console.log("order2b", order2b.signatures)

    order1b.unionSignatures(order2b); // Now order1b have also have all signatures from order2b
    console.log("order1b", order1b.signatures)

    await mw.sendOrder(order1b, keyPairs[0].secretKey);
    console.log("send jetton success!")
}


main();