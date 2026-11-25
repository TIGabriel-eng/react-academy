import type { SyntheticEvent } from 'react';

// Silhueta de pessoa em SVG, usada quando o usuário não tem foto cadastrada
// (ou quando a foto não carrega). Fica inline para não depender de caminhos
// relativos que quebram conforme a rota.
const AVATAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#334155"/><circle cx="32" cy="25" r="11" fill="#cbd5e1"/><path d="M10 60c2-13 11-19 22-19s20 6 22 19z" fill="#cbd5e1"/></svg>`;

export const AVATAR_FALLBACK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(AVATAR_SVG)}`;

// Troca a imagem quebrada pelo fallback. A checagem evita loop caso o próprio fallback falhe.
export function handleAvatarError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (!img.src.startsWith('data:')) img.src = AVATAR_FALLBACK;
}
