export function makeStorageKey(
  prefix: string,
  element: HTMLElement,
  siblingSelector: string,
  name?: string,
): string {
  const siblings = Array.from(document.querySelectorAll(siblingSelector));
  const index = element ? siblings.indexOf(element) : -1;
  const storageKeySuffix = name?.trim() || String(index);
  const route = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname + "/";
  const storageKey = `${prefix}:${route}:${storageKeySuffix}`;
  return storageKey;
}

export function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures such as private mode restrictions.
  }
}
