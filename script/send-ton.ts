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

async function main() {
    const argv = await yargs
        .option('network', {
            alias: 'n',
            type: 'string',
            description: 'network',
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

    // send TON
    let msg: MessageRelaxed = {
        body: beginCell()
            .storeUint(0, 32)
            .storeBuffer(Buffer.from(argv.comment != null?argv.comment :""))
            .endCell(),
        info: {
            bounce: true,
            bounced: false,
            createdAt: 0,
            createdLt: 0n,
            dest: Address.parse(
                argv.dest
            ),
            forwardFee: 0n,
            ihrDisabled: true,
            ihrFee: 0n,
            type: 'internal',
            value: {coins: toNano(argv.amount)},
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
    console.log("send ton success!")
}


main();