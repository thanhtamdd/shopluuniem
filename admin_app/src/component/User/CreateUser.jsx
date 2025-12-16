import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import isEmpty from 'validator/lib/isEmpty';
import isEmail from 'validator/lib/isEmail';

import userApi from '../Api/userAPI';
import permissionAPI from '../Api/permissionAPI';

function CreateUser() {
  const history = useHistory();
  const [permission, setPermission] = useState([]);
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissionChoose, setPermissionChoose] = useState('');
  const [validationMsg, setValidationMsg] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const ps = await permissionAPI.getAPI();
        setPermission(ps);
      } catch (err) {
        console.error(err);
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
      const response = await userApi.create(user);

      if (response.msg === "Bạn đã thêm thành công") {
        alert(response.msg);
        setName('');
        setUserName('');
        setEmail('');
        setPassword('');
        setPermissionChoose('');
        setValidationMsg({});
        history.push('/user');
      } else {
        setValidationMsg({ api: response.msg });
      }
    } catch (err) {
      console.error(err);
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
            <h4>Create User</h4>
            {validationMsg.api && <div role="alert">{validationMsg.api}</div>}
            <form onSubmit={handleCreate} aria-label="create-user-form">
              <div>
                <label htmlFor="name">Name:</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} />
                <span>{validationMsg.name}</span>
              </div>
              <div>
                <label htmlFor="username">Username:</label>
                <input id="username" value={username} onChange={e => setUserName(e.target.value)} />
                <span>{validationMsg.username}</span>
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input id="email" value={email} onChange={e => setEmail(e.target.value)} />
                <span>{validationMsg.email}</span>
              </div>
              <div>
                <label htmlFor="password">Password:</label>
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <span>{validationMsg.password}</span>
              </div>
              <div>
                <label htmlFor="permissionChoose">Chọn quyền:</label>
                <select id="permissionChoose" value={permissionChoose} onChange={e => setPermissionChoose(e.target.value)}>
                  <option value="">Chọn quyền</option>
                  {permission.map(p => <option key={p._id} value={p._id}>{p.permission}</option>)}
                </select>
                <span>{validationMsg.permission}</span>
              </div>
              <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;
