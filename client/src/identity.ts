/** Stable identity persisted across page reloads */

const CLIENT_ID_KEY = 'rp_clientId';
const NAME_KEY      = 'rp_name';
const AVATAR_KEY    = 'rp_avatar';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) ?? '';
}

export function getSavedAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) ?? '';
}

export function saveIdentity(name: string, avatar: string): void {
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(AVATAR_KEY, avatar);
}
