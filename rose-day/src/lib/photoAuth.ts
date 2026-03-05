const API_IMAGES_PREFIX = '/api/images/';

/**
 * Build the authenticated image URL for protected photos.
 * Use this only when the user has unlocked (cookie is set); otherwise the API returns 403.
 */
export function getAuthenticatedImagePath(path: string): string {
  const trimmed = path.replace(/^\/+/, '').replace(/^images\/+/, '');
  return `${API_IMAGES_PREFIX}${trimmed}`;
}

export const PHOTOS_UNLOCKED_EVENT = 'photosUnlocked';

export function dispatchPhotosUnlocked(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PHOTOS_UNLOCKED_EVENT));
  }
}
