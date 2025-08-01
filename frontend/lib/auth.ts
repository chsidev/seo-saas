import Cookies from 'js-cookie';

export const getToken = (): string | null => {
  return Cookies.get('auth-token') || localStorage.getItem('auth-token');
};

export const setToken = (token: string): void => {
  Cookies.set('auth-token', token, { expires: 7 }); // 7 days
  localStorage.setItem('auth-token', token);
};

export const removeToken = (): void => {
  Cookies.remove('auth-token');
  localStorage.removeItem('auth-token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const hasRole = (user: any, role: string): boolean => {
  return user?.role === role;
};