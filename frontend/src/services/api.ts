declare const API: any;

const BASE_URL = import.meta.env.VITE_API_URL || 'https://orcoma-academy-backend.onrender.com';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(BASE_URL + '/api/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
    credentials: 'same-origin',
  });

  if (!res.ok) throw new Error('Refresh failed');

  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
  return data.access;
}

function forceLogout() {
  const keys = ['access_token', 'refresh_token', 'orcoma_user_role', 'orcoma_user_email', 'orcoma_user_name', 'orcoma_user_avatar', 'orcoma_plano_nome'];
  keys.forEach(k => localStorage.removeItem(k));
  window.location.href = '/login';
}

async function request(method: string, path: string, body?: any, _retry = false): Promise<any> {
  if (typeof API !== 'undefined') {
    if (body !== undefined) {
      return API[method.toLowerCase()]?.(path, body) ?? API.get?.(path);
    }
    return API[method.toLowerCase()]?.(path) ?? API.get?.(path);
  }

  const url = BASE_URL + path;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;

  const options: RequestInit = { method, headers, credentials: 'same-origin' as RequestCredentials };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  const isLoginPath = path === '/api/token/';
  if (res.status === 401 && !_retry && !isLoginPath) {
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        headers['Authorization'] = 'Bearer ' + newToken;
        return fetch(url, { ...options, headers }).then(r => r.json());
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      headers['Authorization'] = 'Bearer ' + newToken;
      const retryRes = await fetch(url, { ...options, headers });
      let retryData;
      try { retryData = await retryRes.json(); } catch { retryData = null; }
      if (!retryRes.ok) {
        const err = new Error(retryData?.detail || 'Erro na requisição');
        (err as any).status = retryRes.status;
        (err as any).data = retryData;
        throw err;
      }
      return retryData;
    } catch (err) {
      processQueue(err, null);
      forceLogout();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  let data;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const err = new Error(data?.detail || 'Erro na requisição');
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }
  return data;
}

export const ApiService = {
  BASE_URL,

  get(path: string) {
    return request('GET', path);
  },

  post(path: string, body?: any) {
    return request('POST', path, body);
  },

  patch(path: string, body?: any) {
    return request('PATCH', path, body);
  },

  put(path: string, body?: any) {
    return request('PUT', path, body);
  },

  del(path: string) {
    return request('DELETE', path);
  },

  async logout() {
    if (typeof API !== 'undefined' && API.logout) {
      return API.logout();
    }
    try {
      await fetch(BASE_URL + '/api/logout/', { method: 'POST', credentials: 'same-origin' });
    } catch {}
    const keys = ['access_token', 'refresh_token', 'orcoma_user_role', 'orcoma_user_email', 'orcoma_user_name', 'orcoma_user_avatar', 'orcoma_plano_nome'];
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Dashboard
  async getDashboard() {
    return this.get('/api/dashboard/');
  },

  // Cursos
  async getCursos() {
    return this.get('/api/cursos/');
  },

  async getCursosRecomendados() {
    return this.get('/api/cursos-recomendados/');
  },

  // Matriculas
  async getMinhasMatriculas() {
    return this.get('/api/matriculas/minhas/');
  },

  // Eventos
  async getEventos() {
    return this.get('/api/eventos/');
  },

  // Trilhas
  async getTrilhas() {
    return this.get('/api/trilhas/');
  },

  // Perfil
  async getMe() {
    return this.get('/api/me/');
  },

  async patchMe(data: any) {
    return this.patch('/api/me/', data);
  },

  async uploadAvatar(file: File) {
    const url = BASE_URL + '/api/avatar/';
    const headers: Record<string, string> = {};
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(url, { method: 'POST', headers, body: formData, credentials: 'same-origin' });
    let data;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) throw new Error(data?.detail || data?.error || 'Erro ao enviar avatar');
    return data;
  },

  // Formações
  async getFormacoes() {
    return this.get('/api/formacoes/');
  },

  async postFormacao(dados: any) {
    return this.post('/api/formacoes/', dados);
  },

  async patchFormacao(id: number, dados: any) {
    return this.patch('/api/formacoes/' + id + '/', dados);
  },

  async delFormacao(id: number) {
    return this.del('/api/formacoes/' + id + '/');
  },

  // Habilidades
  async getHabilidades() {
    return this.get('/api/habilidades/');
  },

  async postHabilidade(dados: any) {
    return this.post('/api/habilidades/', dados);
  },

  async delHabilidade(id: number) {
    return this.del('/api/habilidades/' + id + '/');
  },

  // Curso Módulos
  async getCursoModulos(slug: string) {
    return this.get('/api/cursos/' + slug + '/modulos/');
  },

  // Avaliações / Reviews
  async getAvaliacoes(moduloId: number | string) {
    return this.get('/api/modulos/' + moduloId + '/avaliacoes/');
  },

  async postAvaliacao(moduloId: number | string, data: { modulo?: number | string; nota: number; comentario: string }) {
    return this.post('/api/modulos/' + moduloId + '/avaliacoes/', data);
  },

  // Comentários
  async getComentarios(moduloId: number | string) {
    return this.get('/api/modulos/' + moduloId + '/comentarios/');
  },

  async postComentario(moduloId: number | string, data: { texto: string; comentario_pai?: number }) {
    return this.post('/api/modulos/' + moduloId + '/comentarios/', data);
  },

  async deleteComentario(comentarioId: number) {
    return this.del('/api/comentarios/' + comentarioId + '/');
  },

  async curtirComentario(comentarioId: number) {
    return this.post('/api/comentarios/' + comentarioId + '/curtir/');
  },

  // Matrícula - posição do vídeo
  async salvarPosicao(cursoId: number, videoId: number | null, segundo: number) {
    return this.post('/api/matriculas/salvar-posicao/', { curso: cursoId, video_id: videoId, segundo });
  },

  async getPosicao(cursoId: number) {
    return this.get('/api/matriculas/posicao/?curso=' + cursoId);
  },

  async concluirCurso(cursoId: number) {
    return this.post('/api/matriculas/concluir/', { curso: cursoId });
  },

  // User Stats
  async getUserStats(academia?: string) {
    let url = '/api/user-stats/';
    if (academia) url += '?academia=' + encodeURIComponent(academia);
    return this.get(url);
  },

  // Metas Semanais
  async getMetasSemanais() {
    return this.get('/api/metas-semanais/');
  },

  async postMetaSemanal(dados: any) {
    return this.post('/api/metas-semanais/', dados);
  },

  // Notificações
  async getNotificacoes() {
    return this.get('/api/notificacoes/');
  },

  async getNotificacoesNaoLidasCount() {
    return this.get('/api/notificacoes/nao-lidas/count/');
  },

  async marcarNotificacaoLida(id: number) {
    return this.post('/api/notificacoes/marcar-lida/', { id });
  },

  async marcarTodasNotificacoesLidas() {
    return this.post('/api/notificacoes/marcar-todas-lidas/');
  },

  async criarLembreteEventos() {
    return this.post('/api/notificacoes/criar-lembrete-eventos/');
  },
};