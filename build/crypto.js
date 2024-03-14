"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symDecrypt = exports.symEncrypt = exports.importSymKey = exports.exportSymKey = exports.createRandomSymmetricKey = exports.rsaDecrypt = exports.rsaEncrypt = exports.importPrvKey = exports.importPubKey = exports.exportPrvKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
const crypto_1 = require("crypto");
// #############
// ### Utils ###
// #############
// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}
// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    var buff = Buffer.from(base64, 'base64');
    return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}
// ################
// ### RSA keys ###
// ################
// Generates a pair of private/public RSA keys
async function generateRsaKeyPair() {
    const keyPair = await crypto_1.webcrypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
    }, true, ['encrypt', 'decrypt']);
    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
    };
}
exports.generateRsaKeyPair = generateRsaKeyPair;
// Export a crypto public key to a base64 string format
async function exportPubKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey('spki', key);
    return arrayBufferToBase64(exported);
}
exports.exportPubKey = exportPubKey;
// Export a crypto private key to a base64 string format
async function exportPrvKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey('pkcs8', key);
    return arrayBufferToBase64(exported);
}
exports.exportPrvKey = exportPrvKey;
// Import a base64 string public key to its native format
async function importPubKey(strKey) {
    const keyBuffer = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('spki', keyBuffer, {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
    }, true, ['encrypt']);
}
exports.importPubKey = importPubKey;
// Import a base64 string private key to its native format
async function importPrvKey(strKey) {
    const keyBuffer = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('pkcs8', keyBuffer, {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
    }, true, ['decrypt']);
}
exports.importPrvKey = importPrvKey;
// Encrypt a message using an RSA public key
// Encrypt a message using an RSA public key
async function rsaEncrypt(b64Data, strPublicKey) {
    const publicKey = await importPubKey(strPublicKey);
    const data = base64ToArrayBuffer(b64Data);
    const encrypted = await crypto_1.webcrypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, data);
    return arrayBufferToBase64(encrypted);
}
exports.rsaEncrypt = rsaEncrypt;
// Decrypts a message using an RSA private key
async function rsaDecrypt(data, privateKey) {
    const encryptedData = base64ToArrayBuffer(data);
    const decrypted = await crypto_1.webcrypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedData);
    const decoder = new TextDecoder();
    return arrayBufferToBase64(new Uint8Array(decrypted)); // Return as base64
}
exports.rsaDecrypt = rsaDecrypt;
// ######################
// ### Symmetric keys ###
// ######################
// Generates a random symmetric key
// Generates a random symmetric key
async function createRandomSymmetricKey() {
    return await crypto_1.webcrypto.subtle.generateKey({
        name: 'AES-CBC',
        length: 256,
    }, true, ['encrypt', 'decrypt']);
}
exports.createRandomSymmetricKey = createRandomSymmetricKey;
// Export a crypto symmetric key to a base64 string format
async function exportSymKey(key) {
    const exportedKey = await crypto_1.webcrypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exportedKey);
}
exports.exportSymKey = exportSymKey;
// Import a base64 string format to its crypto native format
async function importSymKey(strKey) {
    const keyBuffer = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey('raw', keyBuffer, {
        name: 'AES-CBC',
        length: 256,
    }, true, ['encrypt', 'decrypt']);
}
exports.importSymKey = importSymKey;
// Encrypt a message using a symmetric key
async function symEncrypt(key, data) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const iv = crypto_1.webcrypto.getRandomValues(new Uint8Array(16)); // IV for AES-GCM
    const encryptedData = await crypto_1.webcrypto.subtle.encrypt({
        name: "AES-CBC",
        iv: iv,
    }, key, encodedData);
    // Combine the IV with the encrypted data
    const combinedIvAndData = new Uint8Array(iv.length + encryptedData.byteLength);
    combinedIvAndData.set(iv, 0);
    combinedIvAndData.set(new Uint8Array(encryptedData), iv.length);
    // Convert the combined IV + data array to a base64 string
    return arrayBufferToBase64(combinedIvAndData);
}
exports.symEncrypt = symEncrypt;
// Decrypt a message using a symmetric key
async function symDecrypt(strKey, encryptedData) {
    const symKey = await importSymKey(strKey);
    const combinedIvAndData = base64ToArrayBuffer(encryptedData);
    const iv = combinedIvAndData.slice(0, 16);
    const data = combinedIvAndData.slice(16);
    const decryptedData = await crypto_1.webcrypto.subtle.decrypt({
        name: "AES-CBC",
        iv: new Uint8Array(iv),
    }, symKey, data);
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
}
exports.symDecrypt = symDecrypt;
