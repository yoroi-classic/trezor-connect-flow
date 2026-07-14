"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardanoTxAuxiliaryDataSupplementType = exports.CardanoTxWitnessType = exports.CardanoGovernanceRegistrationFormat = exports.CardanoPoolRelayType = exports.CardanoDRepType = exports.CardanoCertificateType = exports.CardanoTxOutputSerializationFormat = exports.CardanoDerivationType = exports.CardanoAddressType = exports.CardanoTxSigningMode = exports.DEVICE_EVENT = exports.UI_EVENT = void 0;
const connect_web_1 = __importDefault(require("@trezor/connect-web"));
var connect_web_2 = require("@trezor/connect-web");
Object.defineProperty(exports, "UI_EVENT", { enumerable: true, get: function () { return connect_web_2.UI_EVENT; } });
Object.defineProperty(exports, "DEVICE_EVENT", { enumerable: true, get: function () { return connect_web_2.DEVICE_EVENT; } });
exports.CardanoTxSigningMode = {
    ORDINARY_TRANSACTION: 0,
    POOL_REGISTRATION_AS_OWNER: 1,
    MULTISIG_TRANSACTION: 2,
    PLUTUS_TRANSACTION: 3
};
exports.CardanoAddressType = {
    BASE: 0,
    BASE_SCRIPT_KEY: 1,
    BASE_KEY_SCRIPT: 2,
    BASE_SCRIPT_SCRIPT: 3,
    POINTER: 4,
    POINTER_SCRIPT: 5,
    ENTERPRISE: 6,
    ENTERPRISE_SCRIPT: 7,
    BYRON: 8,
    REWARD: 14,
    REWARD_SCRIPT: 15
};
exports.CardanoDerivationType = {
    LEDGER: 0,
    ICARUS: 1,
    ICARUS_TREZOR: 2
};
exports.CardanoTxOutputSerializationFormat = {
    ARRAY_LEGACY: 0,
    MAP_BABBAGE: 1
};
exports.CardanoCertificateType = {
    STAKE_REGISTRATION: 0,
    STAKE_DEREGISTRATION: 1,
    STAKE_DELEGATION: 2,
    STAKE_POOL_REGISTRATION: 3,
    STAKE_REGISTRATION_CONWAY: 7,
    STAKE_DEREGISTRATION_CONWAY: 8,
    VOTE_DELEGATION: 9,
};
exports.CardanoDRepType = {
    KEY_HASH: 0,
    SCRIPT_HASH: 1,
    ABSTAIN: 2,
    NO_CONFIDENCE: 3,
};
exports.CardanoPoolRelayType = {
    SINGLE_HOST_IP: 0,
    SINGLE_HOST_NAME: 1,
    MULTIPLE_HOST_NAME: 2
};
exports.CardanoGovernanceRegistrationFormat = {
    CIP15: 0,
    CIP36: 1
};
exports.CardanoTxWitnessType = {
    BYRON_WITNESS: 0,
    SHELLEY_WITNESS: 1
};
exports.CardanoTxAuxiliaryDataSupplementType = {
    NONE: 0,
    GOVERNANCE_REGISTRATION_SIGNATURE: 1
};
class TrezorConnect {
    static async init({ manifest }) {
        return connect_web_1.default.init({ manifest });
    }
    static manifest(manifest) {
        connect_web_1.default.manifest(manifest);
    }
    static on(event, callback) {
        connect_web_1.default.on(event, callback);
    }
    static off(event, callback) {
        connect_web_1.default.off(event, callback);
    }
    static dispose() {
        connect_web_1.default.dispose();
    }
    static cardanoGetPublicKey({ path, showOnTrezor }) {
        return connect_web_1.default.cardanoGetPublicKey({ path, showOnTrezor });
    }
    static cardanoSignTransaction(params) {
        return connect_web_1.default.cardanoSignTransaction(params);
    }
    static cardanoGetAddress(params) {
        return connect_web_1.default.cardanoGetAddress(params);
    }
    static cardanoSignMessage(params) {
        return connect_web_1.default.cardanoSignMessage(params);
    }
}
exports.default = TrezorConnect;
;
