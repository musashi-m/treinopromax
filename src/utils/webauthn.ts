// WebAuthn Passkey & Biometric Authentication Utility (TouchID, FaceID, Windows Hello, Android Credential Manager)

const BIOMETRIC_STORAGE_KEY = 'iron_routine_passkey_v1';
const QUICK_PIN_STORAGE_KEY = 'iron_routine_quick_pin_v1';

export interface StoredPasskey {
  id: string;
  rawId: string;
  email: string;
  registeredAt: string;
}

export interface StoredQuickPin {
  pinHash: string;
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

export function getStoredPasskey(): StoredPasskey | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function getStoredQuickPin(): StoredQuickPin | null {
  try {
    const raw = localStorage.getItem(QUICK_PIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

async function hashPin(pin: string, email: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${pin}:ironroutine`);
  if (window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(`${email}:${pin}`);
}

export async function registerQuickPin(email: string, pin: string): Promise<{ success: boolean; error?: string }> {
  if (!/^\d{4,6}$/.test(pin)) {
    return { success: false, error: 'O PIN deve conter 4 a 6 dígitos numéricos.' };
  }
  const pinHash = await hashPin(pin, email);
  const stored: StoredQuickPin = {
    pinHash,
    email,
    registeredAt: new Date().toISOString(),
  };
  localStorage.setItem(QUICK_PIN_STORAGE_KEY, JSON.stringify(stored));
  return { success: true };
}

export async function authenticateWithQuickPin(pin: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const stored = getStoredQuickPin();
  if (!stored) return { success: false, error: 'Nenhum PIN configurado neste aparelho.' };
  const pinHash = await hashPin(pin, stored.email);
  if (pinHash !== stored.pinHash) {
    return { success: false, error: 'PIN incorreto.' };
  }
  return { success: true, email: stored.email };
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function isCredentialManagerBridgeError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('credential manager') ||
    lower.includes('notreadableerror') ||
    lower.includes('unknownerror') ||
    lower.includes('unknown error') ||
    lower.includes('talking to the credential')
  );
}

/**
 * Register Biometrics / Passkey (Chave de Acesso) on this device.
 * Uses progressive fallback strategies for Android Chrome Credential Manager compatibility.
 */
export async function registerBiometricPasskey(
  email: string,
  userName = 'Vini (Master)'
): Promise<{ success: boolean; error?: string; isCredentialManagerError?: boolean }> {
  if (!isWebAuthnSupported()) {
    return { success: false, error: 'Seu navegador não suporta Chave de Acesso (WebAuthn).' };
  }

  if (!window.isSecureContext) {
    return {
      success: false,
      error: 'A biometria requer HTTPS (use o link da Vercel ou localhost).',
    };
  }

  const rpId = window.location.hostname;
  const userId = new TextEncoder().encode(email);

  const createChallenge = () => {
    const ch = new Uint8Array(32);
    window.crypto.getRandomValues(ch);
    return ch;
  };

  // Strategy 1: Standard Passkey (required residentKey for Android Google Password Manager / iOS / Windows Hello)
  // Strategy 2: Platform biometric without strict residentKey (fixes older Android Play Services / OEM ROMs)
  // Strategy 3: Minimal WebAuthn without authenticatorAttachment / rp.id restriction
  const strategies: Array<() => PublicKeyCredentialCreationOptions> = [
    () => ({
      challenge: createChallenge(),
      rp: { name: 'IronRoutine', id: rpId },
      user: { id: userId, name: email, displayName: userName },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required',
        requireResidentKey: true,
      },
      timeout: 60000,
      attestation: 'none',
    }),
    () => ({
      challenge: createChallenge(),
      rp: { name: 'IronRoutine', id: rpId },
      user: { id: userId, name: email, displayName: userName },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'discouraged',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    }),
    () => ({
      challenge: createChallenge(),
      rp: { name: 'IronRoutine' },
      user: { id: userId, name: email, displayName: userName },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      timeout: 60000,
    }),
  ];

  let lastErrorMsg = '';
  let lastWasCredManager = false;

  for (let i = 0; i < strategies.length; i++) {
    try {
      const credential = (await navigator.credentials.create({
        publicKey: strategies[i](),
      })) as PublicKeyCredential | null;

      if (!credential) {
        return { success: false, error: 'Cadastro de biometria cancelado pelo usuário.' };
      }

      const rawIdStr = uint8ToBase64(new Uint8Array(credential.rawId));
      const stored: StoredPasskey = {
        id: credential.id,
        rawId: rawIdStr,
        email,
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(stored));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      lastErrorMsg = msg;

      if (msg.includes('NotAllowedError') || msg.toLowerCase().includes('cancel')) {
        return { success: false, error: 'Operação cancelada ou permissão biométrica recusada.' };
      }

      lastWasCredManager = isCredentialManagerBridgeError(msg);
      // Only retry next strategy if it's a credential manager / parameter compatibility error
      if (!lastWasCredManager && !msg.toLowerCase().includes('not supported')) {
        break;
      }
    }
  }

  if (lastWasCredManager) {
    return {
      success: false,
      isCredentialManagerError: true,
      error:
        'O Gerenciador de Credenciais do Android bloqueou a Passkey (conflito do Google Play Services ou gerenciador de senhas de terceiros). Você pode usar o PIN Rápido abaixo ou verificar: Configurações do Android > Senhas e Contas > Serviço de preenchimento automático (Google).',
    };
  }

  return { success: false, error: `Falha ao cadastrar biometria: ${lastErrorMsg}` };
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
    if (msg.includes('NotAllowedError') || msg.toLowerCase().includes('cancel')) {
      return { success: false, error: 'Leitura biométrica cancelada.' };
    }
    if (isCredentialManagerBridgeError(msg)) {
      return {
        success: false,
        error:
          'O Gerenciador de Credenciais do Android falhou ao ler a biometria. Entre com seu PIN Rápido ou senha.',
      };
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
