APIs Builder
=============

## 前提
一个支持`HTTP Request`的`client`

## 安装
```
yarn add apis-builder
```

## 使用

以`teambition`为例
```
yarn add teambition
```

```
const apiBuilder = require('apis-builder')
const HttpClient = require('teambition')
const definitions = require('./definitions')

// 前提: HttpClient
apiBuilder.build(HttpClient, definitions)

let sdk = new HttpClient()
let profile = yield sdk.users().me().get()
```

## TODO
- [x] definitions 定义支持 ajv 进行参数校验
- [ ] 使用 proxy 进行重构
