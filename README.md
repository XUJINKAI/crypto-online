# Static Web Crypto App

纯静态网页的密码应用

- 侧重于应用而非工具，提供常见的私密聊天、文件加解密、数据处理等功能
- 针对手机小屏优化
- 无服务器，仅利用浏览器本地存储
- 支持URL参数传参
- 支持JS接口调用（F12控制台）

### TODO

- MSG支持文件
- SM2, SM4
- 对ECDH功能的进一步封装
- 大文件支持
- JS接口整理导出

## MSG 页面密码学原理

`AI生成`

MSG 页面提供端到端加密消息功能，所有密码运算均在浏览器本地完成，不依赖服务器。

### 密码算法

| 用途 | 算法 |
|------|------|
| 非对称密钥交换 | SM2（国密椭圆曲线） |
| 密钥派生 | HKDF（基于 SM3 的密钥扩展函数） |
| 哈希 | SM3 |
| 对称加密 | SM4-CBC |

### 两种会话模式

#### ECDH 模式（密钥协商）

双方各自持有 SM2 密钥对，通过交换公钥建立共享密钥：

```
seed = OtherPublicKey × MyPrivateKey   （SM2 椭圆曲线点乘）
secret = HKDF(seed, 32字节)
  ├─ key = secret[0:16]    （SM4 密钥，128 bit）
  └─  iv = secret[16:32]   （SM4 CBC IV，128 bit）
sid = SM3(key + iv)[0:8]    （会话 ID，取哈希前 8 个十六进制字符）
```

由 ECDH 性质保证：`A_pub × B_pri == B_pub × A_pri`，因此双方派生出相同的 key/iv/sid。

#### PSK 模式（预共享密钥）

双方事先约定一个共享密钥（hex 字符串），直接作为种子派生：

```
secret = HKDF(hexToBytes(psk), 32字节)
  ├─ key = secret[0:16]
  └─  iv = secret[16:32]
sid = SM3(key + iv)[0:8]
```

只要 PSK 相同，双方生成的 key/iv/sid 完全一致。

### 加密 / 解密

消息使用 **SM4-CBC** 模式加密：

- 加密：`plaintext → SM4_CBC_Encrypt(key, iv) → ciphertext（hex 字符串）`
- 解密：`ciphertext → SM4_CBC_Decrypt(key, iv) → plaintext`

### URL 参数定义

消息通过 URL 参数传递，格式：

```
https://example.com/msg?share=<PK>&sid=<SID>&encrypted=<HEX>&id=<TIMESTAMP>
```

| 参数 | 含义 | 说明 |
|------|------|------|
| `share` | 发送者的 SM2 **压缩公钥** | 仅 ECDH 模式使用。接收方用此公钥与自己的私钥做 ECDH，建立/查找会话 |
| `sid` | 会话 ID | 由 `SM3(key + iv)` 前 8 位生成，用于在本地快速定位已有会话 |
| `encrypted` | 密文 | SM4-CBC 加密后的 hex 字符串 |
| `id` | 消息时间戳 | 消息的创建时间（毫秒），同时作为消息的唯一标识 |

#### URL 处理流程

```
收到 URL
  ├─ 有 share → 通过 ECDH 查找/创建会话
  ├─ 仅 sid  → 在本地会话列表中按 sid 查找（PSK 场景）
  └─ 无匹配 → 弹出 PSK 输入框，用户手动输入 PSK 尝试解密
      验证：① sid 匹配  ② 解密成功  → 加入会话列表
```

### 密钥存储

- 用户私钥、会话索引、聊天记录均存储在浏览器 `localStorage` 中
- 会话密钥（key/iv）随会话索引一起存储，打开页面即可直接解密
- **私钥丢失 = 所有 ECDH 会话不可恢复**

## License

MIT @ xujinkai.net
