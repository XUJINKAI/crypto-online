export const help_CN = `
# 一个"手动挡"的加密私聊工具。

对ECDH密钥交换、KDF密钥生成、SM4加密算法的简单封装。

新建会话有两种方式：  
- 一是互相拷贝执行对方的公钥链接，  
- 二是双方输入同一个PSK（Pre-Shared Key）。

信息加密后，通过手动的复制密文，或执行密文链接来查看。  

本工具纯前端应用，通过设置中Local Storage可查看或清除本地数据。  
长期使用请妥善保存密钥，以免丢失数据。

## 声明

- 本工具仅用于学习和交流目的。
- 本工具不保证绝对的安全，也不对数据丢失负责。
- 请勿用于非法用途。
`;

export const help_EN = `
# A "manual" private chat tool.

Simple encapsulation of ECDH key exchange, KDF key generation, and SM4 encryption algorithm.

There are two ways to create a session:  
- One is to copy and execute the public key link of the other party,  
- The other is for both parties to enter the same PSK (Pre-Shared Key).

After the information is encrypted, you can view it by manually copying the ciphertext or executing the ciphertext link.

This tool is a pure front-end application. You can view or clear local data through the Local Storage in the settings.  
Please keep the key properly for long-term use to avoid data loss.

## Statement

- This tool is for learning and communication purposes only.
- This tool does not guarantee absolute security and is not responsible for data loss.
- Do not use it for illegal purposes.
`;