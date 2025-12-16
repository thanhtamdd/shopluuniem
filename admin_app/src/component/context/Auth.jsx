import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
  const [jwt, setJWT] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ CHỈ load từ sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (token && storedUser) {
      setJWT(token);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ LOGIN
  const addLocal = (token, user) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));

    setJWT(token);
    setUser(user);
  };

  // ✅ LOGOUT
  const logOut = () => {
    sessionStorage.clear();
    setJWT(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        jwt,
        user,
        addLocal,
        logOut,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
