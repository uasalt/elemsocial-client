// Функция для преобразования ArrayBuffer в PEM формат
export function arrayBufferToPem(buffer, type) {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    const base64 = btoa(binary);
    let pem = `-----BEGIN ${type}-----\n`;
    pem += base64.match(/.{1,64}/g).join('\n');
    pem += `\n-----END ${type}-----\n`;
    return pem;
}

// Импорт публичного ключа
function importPublicKey(pk) {
    const base64String = pk
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
    const publicKeyBytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    return publicKeyBytes.buffer;
}

// Импорт приватного ключа
function importPrivateKey(pk) {
    const base64String = pk
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');
    const privateKeyBytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    return privateKeyBytes.buffer;
}

// RSA шифрование
export async function rsaEncrypt(data, pk) {
    try {
        const publicKeyBuffer = importPublicKey(pk);
        const publicKeyE = await crypto.subtle.importKey(
            'spki',
            publicKeyBuffer,
            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
            true,
            ['encrypt']
        );
        const encryptedDataBuffer = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKeyE,
            data
        );
        return new Uint8Array(encryptedDataBuffer);
    } catch (error) {
        throw new Error('Ошибка шифрования данных: ' + error.message);
    }
}

// RSA расшифровка
export async function rsaDecrypt(data, privateKey) {
    try {
        const privateKeyE = await crypto.subtle.importKey(
            'pkcs8',
            privateKey,
            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
            true,
            ['decrypt']
        );
        const decryptedDataBuffer = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKeyE,
            data
        );
        return decryptedDataBuffer;
    } catch (error) {
        throw new Error('Ошибка расшифровки данных: ' + error.message);
    }
}

// AES шифрование

// Создание случайного AES‑ключа (32 байта, возвращается в Base64)
export function generateAESKey() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...bytes));
}

// Создание AES‑ключа из строки (с использованием SHA‑256)
// Функция возвращает ключ в формате Base64
async function aesCreateKeyFromWord(word) {
    const encoder = new TextEncoder();
    const data = encoder.encode(word);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
}

// Преобразование Base64 в ArrayBuffer
function base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array([...binaryString].map(char => char.charCodeAt(0)));
    return bytes.buffer;
}

// AES шифрование
export async function aesEncrypt(data, key) {
    const iv = crypto.getRandomValues(new Uint8Array(16));

    try {
        const importedKey = await crypto.subtle.importKey(
            'raw',
            base64ToBytes(key),
            { name: 'AES-CBC' },
            false,
            ['encrypt']
        );
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: iv },
            importedKey,
            data
        );

        // Объединяем IV и зашифрованные данные в один массив
        const result = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encryptedBuffer), iv.byteLength);
        return result;
    } catch (error) {
        console.error("Ошибка при шифровании:", error);
        return null;
    }
}

// AES расшифровка
export async function aesDecrypt(data, key) {
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);

    const importedKey = await crypto.subtle.importKey(
        'raw',
        base64ToBytes(key),
        { name: 'AES-CBC' },
        false,
        ['decrypt']
    );
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        importedKey,
        encrypted
    );
    return decryptedBuffer;
}

// AES расшифровка с использованием ключа в виде Uint8Array
async function aesDecryptUnit8(data, key) {
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);

    const importedKey = await crypto.subtle.importKey(
        'raw',
        Uint8Array.from(key),
        { name: 'AES-CBC' },
        false,
        ['decrypt']
    );
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        importedKey,
        encrypted
    );
    return decryptedBuffer;
}

// AES расшифровка файла
async function aesDecryptFile(file, keyB64, ivB64) {
    const key = base64ToArrayBuffer(keyB64);
    const iv = base64ToArrayBuffer(ivB64);

    try {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: iv },
            cryptoKey,
            file
        );
        return new Uint8Array(decrypted);
    } catch (error) {
        console.error('Ошибка расшифровки данных:', error);
        throw error;
    }
}

// Дополнительные функции

// Преобразование Blob в Uint8Array
export async function blobToUint8Array(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

// Преобразование ArrayBuffer в Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Преобразование Base64 в ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
