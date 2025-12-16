import React, { useState, useContext } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import isEmpty from 'validator/lib/isEmpty';

import userAPI from '../Api/userAPI';
import { AuthContext } from '../context/Auth';

function Login() {
  const { addLocal, jwt, user } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [validationMsg, setValidationMsg] = useState({});
  const [loading, setLoading] = useState(false);

  const history = useHistory();

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
    try {
      const response = await userAPI.login({ identifier, password });

      console.log('[Login Response]', response);

      if (response.success) {
  console.log('Token nhận được:', response.token); // kiểm tra
  addLocal(response.token, response.user);

  const permission = response.user.permission_name || '';
  if (permission === 'Nhân Viên') history.push('/customer');
  else if (permission === 'Admin') history.push('/user');
  else setValidationMsg({ api: 'Bạn không có quyền truy cập' });
}

      else {
        setValidationMsg({ api: response.msg || 'Đăng nhập thất bại' });
      }
    } catch (error) {
      console.error('[Login Error]', error);
      setValidationMsg({ api: 'Server không phản hồi hoặc có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  // Redirect nếu đã login
  if (jwt && user) {
    const permission = user.permission_name || '';
    if (permission === 'Nhân Viên') return <Redirect to="/customer" />;
    if (permission === 'Admin') return <Redirect to="/user" />;
  }

  return (
    <div className="auth-wrapper d-flex no-block justify-content-center align-items-center position-relative"
         style={{ background: 'url(../assets/images/big/auth-bg.jpg) no-repeat center center' }}>
      <div className="auth-box row">
        <div className="col-lg-7 col-md-5 modal-bg-img" style={{ backgroundImage: 'url(../assets/images/big/3.jpg)' }} />
        <div className="col-lg-5 col-md-7 bg-white">
          <div className="p-3">
            <div className="text-center">
              <img src="../assets/images/big/icon.png" alt="wrapkit" />
            </div>
            <h2 className="mt-3 text-center">Sign In</h2>

            {validationMsg.api && <p className="form-text text-danger">{validationMsg.api}</p>}

            <form className="mt-4" onSubmit={(e) => { e.preventDefault(); login(); }}>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label htmlFor="identifier">Email / Username</label>
                    <input
                      className="form-control"
                      name="identifier"
                      type="text"
                      placeholder="Nhập email hoặc username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                    {validationMsg.identifier && <p className="form-text text-danger">{validationMsg.identifier}</p>}
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {validationMsg.password && <p className="form-text text-danger">{validationMsg.password}</p>}
                  </div>
                </div>

                <div className="col-lg-12 text-center">
                  <button type="submit" className="btn btn-block btn-dark" disabled={loading}>
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
