import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import isEmpty from 'validator/lib/isEmpty';
import isEmail from 'validator/lib/isEmail';

import userApi from '../Api/userAPI';
import permissionAPI from '../Api/permissionAPI';

function CreateUser() {
  const history = useHistory(); // v5 dùng useHistory
  const [permission, setPermission] = useState([]);
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissionChoose, setPermissionChoose] = useState('');
  const [validationMsg, setValidationMsg] = useState({});
  const [loading, setLoading] = useState(false);

  // Lấy danh sách quyền
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const ps = await permissionAPI.getAPI();
        setPermission(ps);
      } catch (err) {
        console.error('Fetch permission error:', err);
      }
    };
    fetchPermissions();
  }, []);

  const validateAll = () => {
    const nameRegex = /^[A-Za-zÀ-ỹ ]{3,}$/;
    const usernameRegex = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    let msg = {};

    if (isEmpty(name.trim())) msg.name = "Tên không được để trống";
    else if (!nameRegex.test(name.trim())) msg.name = "Tên sai định dạng (ít nhất 3 ký tự alphabet)";

    if (isEmpty(username.trim())) msg.username = "Username không được để trống";
    else if (!usernameRegex.test(username.trim())) msg.username = "Username sai định dạng";

    if (isEmpty(email.trim())) msg.email = "Email không được để trống";
    else if (!isEmail(email.trim())) msg.email = "Email sai định dạng";

    if (isEmpty(password)) msg.password = "Mật khẩu không được để trống";
    if (isEmpty(permissionChoose)) msg.permission = "Vui lòng chọn quyền";

    setValidationMsg(msg);
    return Object.keys(msg).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const user = { name, username, email, password, permission: permissionChoose };
      const response = await userApi.create(user); // gửi POST body JSON

      if (response.msg === "Bạn đã thêm thành công") {
        alert(response.msg);
        // Reset form
        setName('');
        setUserName('');
        setEmail('');
        setPassword('');
        setPermissionChoose('');
        setValidationMsg({});
        // Redirect về trang user
        history.push('/user');
      } else {
        setValidationMsg({ api: response.msg });
      }
    } catch (err) {
      console.error('Create user error:', err);
      setValidationMsg({ api: 'Server không phản hồi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Create User</h4>

            {validationMsg.api && (
              <div className={`alert ${validationMsg.api === "Bạn đã thêm thành công" ? "alert-success" : "alert-danger"} alert-dismissible fade show`} role="alert">
                {validationMsg.api}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group w-50">
                <label>Name:</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
                <small className="form-text text-danger">{validationMsg.name}</small>
              </div>

              <div className="form-group w-50">
                <label>Username:</label>
                <input type="text" className="form-control" value={username} onChange={e => setUserName(e.target.value)} />
                <small className="form-text text-danger">{validationMsg.username}</small>
              </div>

              <div className="form-group w-50">
                <label>Email:</label>
                <input type="text" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                <small className="form-text text-danger">{validationMsg.email}</small>
              </div>

              <div className="form-group w-50">
                <label>Password:</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                <small className="form-text text-danger">{validationMsg.password}</small>
              </div>

              <div className="form-group w-50">
                <label>Chọn quyền:</label>
                <select className="form-control" value={permissionChoose} onChange={e => setPermissionChoose(e.target.value)}>
                  <option value="">Chọn quyền</option>
                  {permission.map(item => <option key={item._id} value={item._id}>{item.permission}</option>)}
                </select>
                <small className="form-text text-danger">{validationMsg.permission}</small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer text-center text-muted mt-3">
        All Rights Reserved by Adminmart. Designed and Developed by <a href="https://wrappixel.com">WrapPixel</a>.
      </footer>
    </div>
  );
}

export default CreateUser;
