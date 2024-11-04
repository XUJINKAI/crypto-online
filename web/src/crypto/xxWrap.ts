import { hkdf } from "./sm-crypto-v2/src/sm2/kx";
import { sm3 } from "./sm-crypto-v2/src";
import { sm4 } from "./sm-crypto-v2/src/sm4";

Uint8Array.prototype.toHex = function () {
    return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default {
    sm3,
    sm4,
    hkdf,
}