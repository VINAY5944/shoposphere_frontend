
const TOKEN_KEY = "shopsphere_access_token";
const USER_KEY = "shopsphere_user";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),

  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser: (user) => {
    if (user == null) {
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser: () => localStorage.removeItem(USER_KEY),
};
