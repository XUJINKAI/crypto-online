
const desc_CN = `利用ECDH协商密钥并加密信息。复制带公钥的链接给对方，并获取对方公钥，即可加解密信息。`;
const desc_EN = `Utilize ECDH to negotiate secret and encrypt information. Copy the link with the public key to the other party, and get the other party's public key to encrypt and decrypt information.`;

const help_CN = `
### ECDH 帮助

利用 ECDH 密钥交换，生成共享密钥，进行加密/解密操作。  
只要**彼此拥有对方的公钥**，就可以协商出一个共享密钥，用于加密/解密信息。

利用共享链接，可以快速方便的与对方交换信息。

#### 场景1：公开场合的“私信”

1. 将包含你的公钥的链接发送给对方。
2. 对方打开链接后，填入信息并加密，将附带加密信息的链接发回给你。
3. 你打开链接后，页面将显示解密后的信息。

#### 场景2：私密聊天

1. 双方互相发送自己的公钥链接。
2. 输入私密信息，加密后发送给对方。

### 更多说明：

- 本应用无服务器，私钥保存在本地，清理浏览器缓存会导致数据丢失，密钥丢失将无法找回数据。  
如需长期使用，例如在公网发布公钥链接作为私信手段，请妥善保存私钥。
- 应用可以记住最近使用的对方公钥，可以点击下拉框选择。
- sid根据共享密钥生成，用于标识信息的加密密钥，解密时可以根据sid选择正确的对方公钥。
- 双方建立共享密钥后，可以取消勾选“包括我的公钥”选项，缩短链接长度。

### 免责声明：

- 本工具仅供学习交流使用，不保证加密绝对安全。
- 本工具为纯静态网页，不会上传任何数据到服务器。
- 请勿用作非法用途。
`;

const help_EN = `
### ECDH Help

Use ECDH key exchange to generate a shared secret key for encryption/decryption operations.  
As long as **each other has the other's public key**, a shared secret key can be negotiated for encrypting/decrypting information.

By using the shared link, you can quickly and conveniently exchange information with the other party.

#### Scenario 1: "Private Message" in Public Occasions

1. Send the link containing your public key to the other party.
2. After the other party opens the link, fills in the information and encrypts it, the link with the encrypted information will be sent back to you.
3. After you open the link, the page will display the decrypted information.

#### Scenario 2: Private Chat

1. Both parties send each other their public key links.
2. Enter private information, encrypt it, and send it to the other party.

### More Explanation:

- This application has no server, the private key is saved locally, clearing the browser cache will cause data loss, and the data cannot be recovered if the key is lost.  
If you need to use it for a long time, such as publishing a public key link on the public network as a private message method, please keep the private key properly.
- The application can remember the most recently used public key of the other party, you can click the drop-down box to select.
- sid is generated based on the shared secret key, used to identify the encryption key of the information, and you can select the correct public key of the other party according to sid when decrypting.
- After both parties establish a shared secret key, you can uncheck the "Include my public key" option to shorten the link length.

### Disclaimer:

- This tool is for learning and communication purposes only and does not guarantee absolute security of encryption.
- This tool is a pure static webpage and will not upload any data to the server.
- Do not use it for illegal purposes.

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

export default {
    desc_CN,
    desc_EN,
    help_CN,
    help_EN,
};
