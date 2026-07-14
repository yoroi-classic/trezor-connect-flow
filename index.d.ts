export { UI_EVENT, DEVICE_EVENT } from '@trezor/connect-web';
type ValueOf<T> = T[keyof T];
export type Manifest = {
    appName: string;
    appUrl: string;
    email: string;
};
export type UiEvent = any;
export type DeviceEvent = any;
type HDNodeType = {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    private_key?: string;
    public_key: string;
};
export type CardanoPublicKey = {
    node: HDNodeType;
    publicKey: string;
    path: number[];
    serializedPath: string;
};
export type Unsuccessful = {
    success: false;
    payload: {
        error: string;
        code?: string;
    };
};
export type Success<T> = {
    success: true;
    payload: T;
};
export type Response<T> = Promise<Success<T> | Unsuccessful>;
type CardanoTxSigningMode = 0 | 1 | 2 | 3;
export declare const CardanoTxSigningMode: {
    [key: string]: CardanoTxSigningMode;
};
export type CardanoSignTransaction = {
    inputs: CardanoInput[];
    outputs: CardanoOutput[];
    fee: string;
    ttl?: string;
    certificates?: CardanoCertificate[];
    withdrawals?: CardanoWithdrawal[];
    validityIntervalStart?: string;
    auxiliaryData?: CardanoAuxiliaryData;
    mint?: CardanoMint;
    scriptDataHash?: string;
    collateralInputs?: CardanoCollateralInput[];
    requiredSigners?: CardanoRequiredSigner[];
    collateralReturn?: CardanoOutput;
    totalCollateral?: string;
    referenceInputs?: CardanoReferenceInput[];
    additionalWitnessRequests?: (string | number[])[];
    protocolMagic: number;
    networkId: number;
    signingMode: CardanoTxSigningMode;
    derivationType?: CardanoDerivationType;
    includeNetworkId?: boolean;
    tagCborSets?: boolean;
};
export type CardanoInput = {
    path?: string | number[];
    prev_hash: string;
    prev_index: number;
};
export type CardanoToken = {
    assetNameBytes: string;
    amount?: string;
    mintAmount?: string;
};
export type CardanoAssetGroup = {
    policyId: string;
    tokenAmounts: CardanoToken[];
};
export type CardanoCertificatePointer = {
    blockIndex: number;
    txIndex: number;
    certificateIndex: number;
};
type CardanoAddressType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 14 | 15;
export declare const CardanoAddressType: {
    [key: string]: CardanoAddressType;
};
export type CardanoAddressParameters = {
    addressType: CardanoAddressType;
    path?: string | number[];
    stakingPath?: string | number[];
    stakingKeyHash?: string;
    certificatePointer?: CardanoCertificatePointer;
    paymentScriptHash?: string;
    stakingScriptHash?: string;
};
type CardanoDerivationType = 0 | 1 | 2;
export declare const CardanoDerivationType: {
    [key: string]: CardanoDerivationType;
};
type CardanoTxOutputSerializationFormat = 0 | 1;
export declare const CardanoTxOutputSerializationFormat: {
    [key: string]: CardanoTxOutputSerializationFormat;
};
export type CardanoOutput = {
    addressParameters: CardanoAddressParameters;
    amount: string;
    tokenBundle?: CardanoAssetGroup[];
    datumHash?: string;
    format?: CardanoTxOutputSerializationFormat;
    inlineDatum?: string;
    referenceScript?: string;
} | {
    address: string;
    amount: string;
    tokenBundle?: CardanoAssetGroup[];
    datumHash?: string;
    format?: CardanoTxOutputSerializationFormat;
    inlineDatum?: string;
    referenceScript?: string;
};
export declare const CardanoCertificateType: {
    readonly STAKE_REGISTRATION: 0;
    readonly STAKE_DEREGISTRATION: 1;
    readonly STAKE_DELEGATION: 2;
    readonly STAKE_POOL_REGISTRATION: 3;
    readonly STAKE_REGISTRATION_CONWAY: 7;
    readonly STAKE_DEREGISTRATION_CONWAY: 8;
    readonly VOTE_DELEGATION: 9;
};
export type CardanoCertificate = {
    type: ValueOf<typeof CardanoCertificateType>;
    path?: string | number[];
    pool?: string;
    poolParameters?: CardanoPoolParameters;
    scriptHash?: string;
    keyHash?: string;
    deposit?: string;
    dRep?: CardanoDRep;
};
export declare const CardanoDRepType: {
    readonly KEY_HASH: 0;
    readonly SCRIPT_HASH: 1;
    readonly ABSTAIN: 2;
    readonly NO_CONFIDENCE: 3;
};
export type CardanoDRep = {
    type: ValueOf<typeof CardanoDRepType>;
    keyHash?: string;
    scriptHash?: string;
};
export type CardanoPoolParameters = {
    poolId: string;
    vrfKeyHash: string;
    pledge: string;
    cost: string;
    margin: CardanoPoolMargin;
    rewardAccount: string;
    owners: CardanoPoolOwner[];
    relays: CardanoPoolRelay[];
    metadata: CardanoPoolMetadata;
};
export type CardanoPoolOwner = {
    stakingKeyPath?: string | number[];
    stakingKeyHash?: string;
};
type CardanoPoolRelayType = 0 | 1 | 2;
export declare const CardanoPoolRelayType: {
    [key: string]: CardanoPoolRelayType;
};
export type CardanoPoolRelay = {
    type: CardanoPoolRelayType;
    ipv4Address?: string;
    ipv6Address?: string;
    port?: number;
    hostName?: string;
};
export type CardanoPoolMetadata = {
    url: string;
    hash: string;
};
export type CardanoPoolMargin = {
    numerator: string;
    denominator: string;
};
export type CardanoWithdrawal = {
    path?: string | number[];
    amount: string;
    scriptHash?: string;
    keyHash?: string;
};
export type CardanoGovernanceRegistrationDelegation = {
    votePublicKey: string;
    weight: number;
};
type CardanoGovernanceRegistrationFormat = 0 | 1;
export declare const CardanoGovernanceRegistrationFormat: {
    [key: string]: CardanoGovernanceRegistrationFormat;
};
export type CardanoGovernanceRegistrationParameters = {
    votePublicKey?: string;
    stakingPath: string | number[];
    paymentAddressParameters: CardanoAddressParameters;
    nonce: string;
    format?: CardanoGovernanceRegistrationFormat;
    delegations?: CardanoGovernanceRegistrationDelegation[];
    votingPurpose?: number;
};
export type CardanoAuxiliaryData = {
    hash?: string;
    cVoteRegistrationParameters?: CardanoGovernanceRegistrationParameters;
};
export type CardanoMint = CardanoAssetGroup[];
export type CardanoCollateralInput = {
    path?: string | number[];
    prev_hash: string;
    prev_index: number;
};
export type CardanoRequiredSigner = {
    keyPath?: string | number[];
    keyHash?: string;
};
export type CardanoReferenceInput = {
    prev_hash: string;
    prev_index: number;
};
export type CardanoTxWitnessType = 0 | 1;
export declare const CardanoTxWitnessType: {
    [key: string]: CardanoTxWitnessType;
};
export type CardanoSignedTxWitness = {
    type: CardanoTxWitnessType;
    pubKey: string;
    signature: string;
    chainCode?: string;
};
export type CardanoTxAuxiliaryDataSupplementType = 0 | 1;
export declare const CardanoTxAuxiliaryDataSupplementType: {
    [key: string]: CardanoTxAuxiliaryDataSupplementType;
};
export type CardanoAuxiliaryDataSupplement = {
    type: CardanoTxAuxiliaryDataSupplementType;
    auxiliaryDataHash: string;
    governanceSignature?: string;
};
export type CardanoSignedTxData = {
    hash: string;
    witnesses: CardanoSignedTxWitness[];
    auxiliaryDataSupplement?: CardanoAuxiliaryDataSupplement;
};
export type CommonParams = {
    device?: {
        state?: string;
        instance?: number;
    };
    useEmptyPassphrase?: boolean;
    useEventListener?: boolean;
    allowSeedlessDevice?: boolean;
    keepSession?: boolean;
    override?: boolean;
    skipFinalReload?: boolean;
    useCardanoDerivation?: boolean;
};
export type Params<T> = CommonParams & T & {
    bundle?: undefined;
};
export type CardanoGetAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    address?: string;
    showOnTrezor?: boolean;
    derivationType?: CardanoDerivationType;
};
export type CardanoAddress = {
    addressParameters: CardanoAddressParameters;
    protocolMagic: number;
    networkId: number;
    serializedPath: string;
    serializedStakingPath: string;
    address: string;
};
export type CardanoSignMessage = {
    path: string | number[];
    payload: string;
    preferHexDisplay: boolean;
    networkId?: number;
    protocolMagic?: number;
    addressParameters?: CardanoAddressParameters;
    derivationType: CardanoDerivationType;
};
export type CardanoSignMessageResponse = {
    payload: string;
    signature: string;
    headers: {
        protected: {
            1: -8;
            address: string;
        };
        unprotected: {
            version: number;
            hashed: boolean;
        };
    };
    pubKey: string;
};
export default class TrezorConnect {
    static init({ manifest }: {
        manifest: Manifest;
    }): Promise<void>;
    static manifest(manifest: Manifest): void;
    static on(event: any, callback: (_: any) => void): void;
    static off(event: any, callback: (_: any) => void): void;
    static dispose(): void;
    static cardanoGetPublicKey({ path, showOnTrezor }: {
        path: number[];
        showOnTrezor: boolean;
    }): Response<CardanoPublicKey>;
    static cardanoSignTransaction(params: Params<CardanoSignTransaction>): Response<CardanoSignedTxData>;
    static cardanoGetAddress(params: Params<CardanoGetAddress>): Response<CardanoAddress>;
    static cardanoSignMessage(params: Params<CardanoSignMessage>): Response<CardanoSignMessageResponse>;
}
