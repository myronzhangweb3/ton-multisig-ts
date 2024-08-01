import {mnemonicNew, mnemonicValidate} from "ton-crypto";

async function main() {
    const mnemonic = await mnemonicNew();

    const isValid = await mnemonicValidate(mnemonic);
    if (!isValid) {
        throw new Error('Invalid mnemonic');
    }

    console.log("mnemonic: \n", JSON.stringify(mnemonic))
}

main()