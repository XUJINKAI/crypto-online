import { LocalStorageArray, LocalStorageSection } from '@/stores/LocalStorage';
import { computed, ref, watch, type Ref, readonly, reactive, toRaw } from 'vue';
import type { HexString } from '@/crypto/Data';
import { bytesToHex, hexToNumber, numberToHexUnpadded } from '@noble/curves/abstract/utils'
import { sm2, sm3, sm4 } from '@/crypto/sm-crypto-v2/src';
import { arrayToHex, hexToArray, leftPad } from '@/crypto/sm-crypto-v2/src/sm2'
import { sm2Curve } from '@/crypto/sm-crypto-v2/src/sm2/ec'
import { hkdf } from '@/crypto/sm-crypto-v2/src/sm2/kx'

export type SessionHistoryItem = {
    plainData: string;
    encrypted: string;
    from: 'me' | 'other';
    created: number; // id
}

export class MsgSessionHistory {
    private _storage: LocalStorageArray<SessionHistoryItem>;

    get value() { return this._storage.data.value; }

    push(item: SessionHistoryItem): SessionHistoryItem {
        const find = this._storage.data.value.find((i) => i.created === item.created);
        if (find) {
            return find;
        }
        this._storage.data.value.push(item);
        this._storage.SaveData();
        return item;
    }

    remove(id: number) {
        const index = this._storage.data.value.findIndex((i) => i.created === id);
        if (index >= 0) {
            this._storage.data.value.splice(index, 1);
            this._storage.SaveData();
        }
    }

    clear() {
        this._storage.Clear();
    }

    constructor(storage: LocalStorageSection, sid: string) {
        this._storage = storage.getArrayRef<SessionHistoryItem>('history_' + sid);
    }
}

export type SessionSecret = {
    mode: 'sm4-cbc';
    key: string;
    iv: string;
}

export type SessionIndex = {
    sid: string;
    tag: string;
    params: {
        type?: 'ecdh';
        // my_private_key: string;
        my_public_key: string;
        other_public_key: string;
    } | {
        type: 'psk';
        // pre_shared_key: string;
    };
    secret: SessionSecret;
    created: number;
}

export class MsgSession {
    private _msgstore: MsgStore;
    private _data: SessionIndex;

    get tag() { return this._data.tag; }
    set tag(value: string) { this._data.tag = value; }

    get msgstore() { return this._msgstore; }
    get index() { return this._data; }
    get type() { return this.isMe ? 'me' : this._data.params.type; }
    get isMe() { return this._data.params.type == 'ecdh' && this._data.params.my_public_key === this._data.params.other_public_key; }

    encrypt(data: string): string {
        return sm4.encrypt(data, this._data.secret.key, { mode: 'cbc', iv: this._data.secret.iv, output: 'string' });
    }
    decrypt(data: string): string {
        return sm4.decrypt(data, this._data.secret.key, { mode: 'cbc', iv: this._data.secret.iv, output: 'string' });
    }

    private constructor(msgstore: MsgStore, data: SessionIndex) {
        this._msgstore = msgstore;
        this._data = data;
    }

    private static genSeed(sk: HexString, pk: HexString) {
        // 验证私钥合法
        if (!/^[0-9a-fA-F]{64}$/.test(sk)) throw new Error('Invalid private key');

        const pub = sm2Curve.ProjectivePoint.fromHex(pk);
        const pri = hexToNumber(sk);

        // m = pub * pri
        const m = pub.multiply(pri);
        const mHex = leftPad(numberToHexUnpadded(m.x), 32) + leftPad(numberToHexUnpadded(m.y), 32);

        return hexToArray(mHex);
    }

    private static genSecret(seed: Uint8Array): SessionSecret {
        const h = hkdf(seed, 32);
        const s = bytesToHex(h);
        return {
            mode: 'sm4-cbc',
            key: s.slice(0, 32),
            iv: s.slice(32),
        }
    }

    private static genSid(secret: { key: string, iv: string }) {
        const s = secret.key + secret.iv;
        return sm3(s).toString().substring(0, 8);
    }

    static createPskSession(msgstore: MsgStore, psk: string): MsgSession {
        const secret = this.genSecret(hexToArray(psk));
        const sid = this.genSid(secret);
        const session: SessionIndex = {
            sid: sid,
            tag: 'psk_' + sid,
            params: {
                type: 'psk',
            },
            secret: secret,
            created: Date.now()
        };
        return new MsgSession(msgstore, session);
    }

    static createEcdhSession(msgstore: MsgStore, my_private_key: HexString, my_public_key: HexString, other_public_key: HexString): MsgSession {
        const seed = this.genSeed(my_private_key, other_public_key);
        const secret = this.genSecret(seed);
        const sid = this.genSid(secret);
        const session: SessionIndex = {
            sid: sid,
            tag: 'ecdh_' + sid,
            params: {
                type: 'ecdh',
                my_public_key: my_public_key,
                other_public_key: other_public_key
            },
            secret: secret,
            created: Date.now()
        };
        return new MsgSession(msgstore, session);
    }

    static fromSessionIndex(msgstore: MsgStore, data: SessionIndex): MsgSession {
        return new MsgSession(msgstore, data);
    }
}

export class MsgSessionManager {
    private _msgstore: MsgStore;
    private _storage: LocalStorageArray<SessionIndex>;
    private _classes = ref([]) as Ref<MsgSession[]>;

    get data() { return this._classes; }

    LoadData() {
        this._classes.value = [];
        this._classes.value.push(... this._storage.data.value.map((item) => {
            return MsgSession.fromSessionIndex(this._msgstore, item);
        }) as MsgSession[]);
    }

    SaveData() {
        this._storage.Clear();
        this._storage.data.value.push(... this._classes.value.map((item) => {
            return item.index;
        }));
        this._storage.SaveData();
    }

    First(predict?: (value: MsgSession) => boolean): MsgSession | null {
        if (predict) {
            return this._classes.value.find(predict) ?? null;
        } else {
            if (this._classes.value.length == 0) return null;
            return this._classes[0] as MsgSession ?? null;
        }
    }

    Find(sid: string): MsgSession | null {
        return this._classes.value.find((item) => item.index.sid === sid) ?? null;
    }

    // if exists, return the session in the list
    // if not exists, push into list and return
    getSession(session: MsgSession): MsgSession {
        const find = this._classes.value.find((item) => item.index.sid === session.index.sid);
        if (find) {
            return find as MsgSession;
        } else {
            this._classes.value.push(session);
            this.SaveData();
            return session;
        }
    }

    constructor(msgstore: MsgStore, key: string) {
        this._msgstore = msgstore;
        this._storage = this._msgstore.storage.getArrayRef<SessionIndex>(key);
        this.LoadData();
    }
}

export class MsgStore {
    private _storage: LocalStorageSection;
    private _my_key_pair: Sm2KeyPairStorageRef;
    private _session_manager: MsgSessionManager;

    get storage() { return this._storage; }
    get sessions() { return this._session_manager.data; }
    get my_key_pair() { return this._my_key_pair; }

    getPskSession(psk: string): MsgSession {
        const session = MsgSession.createPskSession(this, psk);
        return this._session_manager.getSession(session);
    }

    getSession(sid: string | null, pk?: string | null): MsgSession | null {
        // find and validate sid and pk
        if (!sid && !pk) { return null; }

        let session: MsgSession | null = null;
        if (sid) {
            session = this._session_manager.Find(sid);
        } else if (pk) {
            session = this._session_manager.First((item) => item.index.params.type == 'ecdh'
                // 只检测other_public_key，因为所有session的my_public_key都符合条件
                && (item.index.params.other_public_key === pk));
            if (!session) {
                session = session = MsgSession.createEcdhSession(this, this._my_key_pair.private, this._my_key_pair.public, pk);
            }
        }
        if (session) {
            const sid_match = session.index.sid === sid;
            const pk_match = session.index.params.type == 'ecdh' && (session.index.params.other_public_key === pk || session.index.params.my_public_key === pk);
            if (sid && !sid_match || pk && !pk_match) {
                throw new Error('Get Session Error');
            }
            return this._session_manager.getSession(session);
        }
        return null;
    }

    getRecentSession(): MsgSession | null {
        return this._session_manager.First();
    }

    resetKeyPair() {
        this._my_key_pair.regenerateKeyPair();
    }

    removeSession(sid: string) {
        const find = this._session_manager.Find(sid);
        if (find) {
            this._session_manager.data.value.splice(this._session_manager.data.value.indexOf(find), 1);
            this._session_manager.SaveData();
        }
    }

    saveSessions(){
        this._session_manager.SaveData();
    }

    getHistory(sid?: string): MsgSessionHistory | null {
        if (!sid) {
            return null;
        }
        return new MsgSessionHistory(this._storage, sid);
    }

    constructor(localstorage: LocalStorageSection) {
        this._storage = localstorage;
        // my key pair
        this._my_key_pair = new Sm2KeyPairStorageRef(this._storage, 'my_private_key');
        // sessions
        this._session_manager = new MsgSessionManager(this, 'sessions_index');
    }
}

class Sm2KeyPairStorageRef {
    private readonly _sk_storage: Ref<HexString | null>;
    private readonly _sk = ref<HexString>('');
    private readonly _pk = ref<HexString>('');

    get private() {
        return this._sk.value;
    }
    get public() {
        return this._pk.value;
    }

    regenerateKeyPair() {
        const keypair = sm2.generateKeyPairHex();
        this._sk.value = keypair.privateKey;
        this.setPublicKeyByPrivateKey();
        this._sk_storage.value = this._sk.value;
    }

    private setPublicKeyByPrivateKey() {
        const pk = sm2.getPublicKeyFromPrivateKey(this._sk.value);
        this._pk.value = sm2.compressPublicKeyHex(pk);
    }

    constructor(storage: LocalStorageSection, private_key_key: string) {
        this._sk_storage = storage.getValueRef<HexString>(private_key_key);
        if (this._sk_storage.value === null) {
            this.regenerateKeyPair();
        } else {
            this._sk.value = this._sk_storage.value;
            this.setPublicKeyByPrivateKey();
        }
    }
}