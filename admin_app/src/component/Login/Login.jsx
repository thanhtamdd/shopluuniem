import React, { useState, useContext, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import isEmpty from 'validator/lib/isEmpty';

import userAPI from '../Api/userAPI';
import { AuthContext } from '../context/Auth';

function Login() {
  const { addLocal, jwt, user } = useContext(AuthContext);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [validationMsg, setValidationMsg] = useState({});
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validateAll = () => {
    const msg = {};
    if (isEmpty(identifier)) msg.identifier = 'Email hoặc Username không được để trống';
    if (isEmpty(password)) msg.password = 'Password không được để trống';
    setValidationMsg(msg);
    return Object.keys(msg).length === 0;
  };

  const login = async () => {
    if (!validateAll()) return;

    setLoading(true);
    setValidationMsg({});

    try {
      const response = await userAPI.login({ identifier, password });
      console.log('[Login Response]', response);

      if (!response.success) {
        if (mountedRef.current) {
          setValidationMsg({ api: response.msg || 'Đăng nhập thất bại' });
        }
        return;
      }

      addLocal(response.token, response.user);

    } catch (error) {
      console.error(error);
      if (mountedRef.current) {
        setValidationMsg({ api: 'Server lỗi' });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // ===== REDIRECT =====
  if (jwt && user) {
    if (user.id_permission === 1) return <Redirect to="/user" />;
    if (user.id_permission === 2) return <Redirect to="/customer" />;
    return <Redirect to="/403" />;
  }

  return (
    <div
      className="auth-wrapper d-flex no-block justify-content-center align-items-center position-relative"
      style={{
        background: 'url(../assets/images/big/auth-bg.jpg) no-repeat center center',
        backgroundSize: 'cover'
      }}
    >
      <div className="auth-box row">
        <div
          className="col-lg-7 col-md-5 modal-bg-img"
          style={{ backgroundImage: 'url(../assets/images/big/3.jpg)' }}
        ></div>

        <div className="col-lg-5 col-md-7 bg-white">
          <div className="p-3">
            <div className="text-center">
              <img src="../assets/images/big/icon.png" alt="icon" />
            </div>

            <h2 className="mt-3 text-center">Sign In</h2>

            {validationMsg.api && (
              <p className="form-text text-danger text-center">
                {validationMsg.api}
              </p>
            )}

            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
            >
              <div className="row">
                <div className="col-lg-12">
                  <label htmlFor="username">Email / Username</label>
                  <input
                    id="username"
                    className="form-control"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  {validationMsg.identifier && (
                    <p className="form-text text-danger">
                      {validationMsg.identifier}
                    </p>
                  )}
                </div>

                <div className="col-lg-12">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {validationMsg.password && (
                    <p className="form-text text-danger">
                      {validationMsg.password}
                    </p>
                  )}
                </div>

                <div className="col-lg-12 text-center mt-3">
                  <button
                    type="submit"
                    className="btn btn-dark btn-block"
                    disabled={loading}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Sign In'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
