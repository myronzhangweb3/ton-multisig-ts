import {
    TonClient,
    MultisigWallet,
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

    try {
        // wallet should be active and have some balance
        await mw.deployExternal();
    } catch (Error) {
        console.log("Wallet already deployed");
    }

    console.log("active wallet success!")
}


main();