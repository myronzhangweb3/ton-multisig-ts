import {KeyPair, mnemonicToPrivateKey} from "ton-crypto";

let mnemonics = [
    [
        "praise", "wing", "profit", "kind", "nest", "excite", "walnut", "crew", "hill", "history", "remain", "joy", "entire", "ability", "mixture", "hamster", "bonus", "avoid", "empower", "digital", "achieve", "enroll", "vendor", "fluid"
    ],
    [
        "crush", "pattern", "journey", "honey", "bamboo", "riot", "immune", "enforce", "thing", "clinic", "demise", "hub", "hunt", "benefit", "other", "echo", "truck", "time", "region", "pluck", "decade", "task", "capital", "sport"
    ],
];

export async function getKeyPairs(): Promise<KeyPair[]> {
    let keyPairs: KeyPair[] = [];

    for (let i = 0; i < mnemonics.length; i++)
        keyPairs[i] = await mnemonicToPrivateKey(mnemonics[i]);

    return keyPairs
}