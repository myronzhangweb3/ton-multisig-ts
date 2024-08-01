# TON Multisig

> https://docs.ton.org/mandarin/develop/smart-contracts/tutorials/multisig-js

## Install

```shell
yarn install
```

## Usage

### Generate mnemonic

```shell
npm run mnemonic
```

### Active wallet

```shell
npm run active -- -n testnet
```

### Send Ton

```shell
npm run send-ton -- -n testnet -d 0QBZzQ3m8rceq9Y089I6BOz4i9oAscqSzbKOQd7haMWZfDZY -a 0.0001 -c 'swap1'
```

### Send Token

```shell
npm run send-token -- -n testnet --jm kQBLqmdmFW4UqARMFlGvwspblakQCsjCvl-qRI5LY7au_wLZ --jd 18 -d 0QBZzQ3m8rceq9Y089I6BOz4i9oAscqSzbKOQd7haMWZfDZY -a 0.0001 -c 'swap1'
```