const description = `利用ECDH协商密钥并加密信息。Utilize ECDH to negotiate secret and encrypt information.`;
const help_CN = `
### 快速使用：

如果你收到一个此页面的链接，且这个链接包含一个对方的公钥，那么此时 Secret 栏会自动计算出共享密钥。此时你只需要：

1. 在左侧文本框输入明文并加密。
2. 点击右侧文本框下的 Copy URL 复制链接，发回给对方。

此链接会附带你自己的公钥和加密后的文本，此文本只有对方可以解密。

### 完整步骤：

1. 发送**我的公钥**给对方 (My Public Key);  
或点击Copy URL复制带公钥的链接给对方.
2. 将**对方的公钥**粘贴到输入框 (Other's Public Key);  
或通过带公钥的链接自动填写.
3. 此时你和对方共享同一个密钥，可以进行加密/解密操作.  
通过加密文本框下的链接可以快速复制加密后的文本或带加密文本的链接.

### 说明：

利用 ECDH 密钥交换，生成共享密钥，进行加密/解密操作。  
私钥请妥善保存，不要发送到公共区域。  
页面会自动生成一个私钥并保存到本地(localStorage), 你可以点击 Generate 生成新的私钥.  

### 使用场景：

- 在公开场合的“私信”：将你的公钥公开，任何人都可以利用此公钥给你回复一段只有你能解密的“私信”。
- 在不受信任的聊天工具中，可以利用此工具二次加密，保护聊天内容。

请一定妥善保管自己的私钥，不要泄露给他人。
`;
const help_EN = `
### Quick Start:

If you receive a link to this page, and the link contains the other's public key, the **Secret** field will auto filled.   
At this point, you only need to:

1. Enter plaintext in the left text box and encrypt it.
2. Click **Copy URL** below the encrypted box and send it back to the other party.

The link will include your own public key and the encrypted text, which only the other party can decrypt.

### Full Steps:

1. Send **My Public Key** to the other party;  
Or click Copy URL and send to the other party.
2. Paste **Other's Public Key** into the box;  
Or auto fill through the link.
3. Then you and the other party share the same secret key.  
You can quickly copy the encrypted text or the link with the encrypted text by clicking the link below the encrypted text box.

## Detail:

Use ECDH key exchange to generate a shared secret key for encryption/decryption.  
Please keep your private key safe and do not send it to public area.  
The page will automatically generate a private key and save it to local storage, you can click Generate to generate a new private key.

## Algorithm:

\`\`\`
sk = your private key (sm2 key)
pk = your public key = sk * G
share = other's public key

secret = kdf(sk * share, 32)
enc/dec: sm4-cbc, key = secret[0..16], iv = secret[16..]
sid = sm3(secret)[0..8]
\`\`\`
`;

export default { description, help_CN, help_EN };
