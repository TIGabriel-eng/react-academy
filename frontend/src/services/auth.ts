const auth = typeof window !== 'undefined' ? (window as any).auth : undefined;

export const AuthService = {
  getAccessToken(): string | null {
    return auth?.getAccessToken?.() ?? localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return auth?.getRefreshToken?.() ?? localStorage.getItem('refresh_token');
  },

  getUser() {
    if (auth?.getUser) return auth.getUser();
    return {
      role: localStorage.getItem('orcoma_user_role') || 'visitor',
      email: localStorage.getItem('orcoma_user_email') || '',
      name: localStorage.getItem('orcoma_user_name') || '',
      avatar: localStorage.getItem('orcoma_user_avatar') || '',
      plano_nome: localStorage.getItem('orcoma_plano_nome') || '',
    };
  },

  getRole(): string {
    return (auth?.getRole?.() ?? localStorage.getItem('orcoma_user_role')) || 'visitor';
  },

  getEmail(): string {
    return (auth?.getEmail?.() ?? localStorage.getItem('orcoma_user_email')) || '';
  },

  getName(): string {
    return (auth?.getName?.() ?? localStorage.getItem('orcoma_user_name')) || 'Usuário';
  },

  getAvatar(): string {
    return (auth?.getAvatar?.() ?? localStorage.getItem('orcoma_user_avatar')) || '';
  },

  getPlanoNome(): string {
    return (auth?.getPlanoNome?.() ?? localStorage.getItem('orcoma_plano_nome')) || '';
  },

  getCurrentAcademy(): string {
    return (auth?.getCurrentAcademy?.() ?? localStorage.getItem('current_academy')) || 'Academy Business';
  },

  setCurrentAcademy(name: string) {
    auth?.setCurrentAcademy?.(name);
    localStorage.setItem('current_academy', name);
  },

  isLoggedIn(): boolean {
    return auth?.isLoggedIn?.() ?? !!localStorage.getItem('access_token');
  },

  logout() {
    if (auth?.logout) {
      auth.logout();
    } else {
      const keys = ['access_token', 'refresh_token', 'orcoma_user_role', 'orcoma_user_email', 'orcoma_user_name', 'orcoma_user_avatar', 'orcoma_plano_nome'];
      keys.forEach(k => localStorage.removeItem(k));
    }
  },

  login(tokens: { access: string; refresh?: string }, userData: any) {
    if (auth?.login) {
      auth.login(tokens, userData);
    } else {
      localStorage.setItem('access_token', tokens.access);
      if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
      if (userData.role) localStorage.setItem('orcoma_user_role', userData.role);
      if (userData.email) localStorage.setItem('orcoma_user_email', userData.email);
      if (userData.name) localStorage.setItem('orcoma_user_name', userData.name);
      if (userData.avatar) localStorage.setItem('orcoma_user_avatar', userData.avatar);
      if (userData.plano_nome) localStorage.setItem('orcoma_plano_nome', userData.plano_nome);
    }
  },

  setUser(data: any) {
    if (auth?.setUser) auth.setUser(data);
  },
};