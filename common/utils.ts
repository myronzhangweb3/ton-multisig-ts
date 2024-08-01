export function serializeSignature(signatures: any) {
    return JSON.stringify(signatures)
}

export function deserializationSignature(signaturesStr: string) {
    let signatures: { [key: number]: Buffer; } = {};

    for (let key in JSON.parse(signaturesStr)) {
        signatures[parseInt(key)] = Buffer.from(JSON.parse(signaturesStr)[key].data);
    }

    return signatures
}