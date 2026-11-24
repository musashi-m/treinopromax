// WebAuthn Passkey & Biometric Authentication Utility (TouchID, FaceID, Windows Hello, Fingerprint)

const BIOMETRIC_STORAGE_KEY = 'iron_routine_passkey_v1';

export interface StoredPasskey {
  id: string; // base64 or hex
  rawId: string;
  email: string;
  registeredAt: string;
}

/**
 * Checks if WebAuthn API is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

/**
 * Checks if biometric / platform authenticator is available on this device
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns stored passkey info if registered on this device
 */
export function getStoredPasskey(): StoredPasskey | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

/**
 * Register Biometrics / Passkey (Chave de Acesso) on this device
 */
export async function registerBiometricPasskey(
  email: string,
  userName = 'Vini (Master)'
): Promise<{ success: boolean; error?: string }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'Seu navegador não suporta Chave de Acesso (WebAuthn).' };
  }

  try {
    // Generate random 32-byte challenge
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // User identifier buffer
    const userId = new TextEncoder().encode(email);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'IronRoutine App',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: email,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Windows Hello, Touch ID, Face ID
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Cadastro de biometria cancelado pelo usuário.' };
    }

    // Convert rawId to string
    const rawIdArr = Array.from(new Uint8Array(credential.rawId));
    const rawIdStr = btoa(String.fromCharCode(...rawIdArr));

    const stored: StoredPasskey = {
      id: credential.id,
      rawId: rawIdStr,
      email,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(stored));

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NotAllowedError') || msg.includes('cancel')) {
      return { success: false, error: 'Operação cancelada ou permissão biométrica recusada.' };
    }
    return { success: false, error: `Falha ao cadastrar biometria: ${msg}` };
  }
}

/**
 * Verify Biometrics / Passkey (Login com Chave de Acesso)
 */
export async function authenticateWithBiometrics(): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'Biometria não suportada neste navegador.' };
  }

  const stored = getStoredPasskey();
  const targetEmail = stored?.email || 'vini@gmail.com';

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const allowCredentials: PublicKeyCredentialDescriptor[] = [];
    if (stored?.rawId) {
      try {
        const rawIdBytes = Uint8Array.from(atob(stored.rawId), (c) => c.charCodeAt(0));
        allowCredentials.push({
          type: 'public-key',
          id: rawIdBytes,
          transports: ['internal'],
        });
      } catch {
        // continue without filter
      }
    }

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: window.location.hostname,
      userVerification: 'preferred',
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    };

    const assertion = await navigator.credentials.get({
      publicKey: requestOptions,
    });

    if (!assertion) {
      return { success: false, error: 'Biometria não reconhecida ou cancelada.' };
    }

    return { success: true, email: targetEmail };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NotAllowedError') || msg.includes('cancel')) {
      return { success: false, error: 'Leitura biométrica cancelada.' };
    }
    return { success: false, error: `Erro na leitura biométrica: ${msg}` };
  }
}

/**
 * Remove stored passkey
 */
export function removeStoredPasskey(): void {
  localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
}
