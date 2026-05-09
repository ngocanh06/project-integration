export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
export const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};
export const removeUser = () => localStorage.removeItem('user');
