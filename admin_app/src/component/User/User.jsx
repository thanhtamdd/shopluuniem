import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import userAPI from '../Api/userAPI';
import Pagination from '../Shared/Pagination';
import Search from '../Shared/Search';

function User() {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 4,
    search: '',
    status: true
  });
  const [users, setUsers] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getAPI(filter);
        console.log('User API response:', res);
        setUsers(res.users || []);
        setTotalPage(res.totalPage || 1);
      } catch (err) {
        setUsers([]);
        setTotalPage(1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const onPageChange = (value) => setFilter({ ...filter, page: Number(value) });
  const handlerSearch = (value) => setFilter({ ...filter, page: 1, search: value });
  const handleDelete = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user "${user.fullname}"?`)) return;
    try {
      const res = await userAPI.delete(user._id);
      if (res.msg === 'Thanh Cong') setFilter({ ...filter, status: !filter.status });
    } catch {}
  };

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="card user-card">
          <div className="card-body user-card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Users</h4>
              <Link to="/user/create" className="btn btn-primary">New create</Link>
            </div>

            <Search handlerSearch={handlerSearch} />

            {loading ? (
              <div className="text-center p-3">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center p-3">Không tìm thấy user</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered no-wrap mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Permission</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.fullname}</td>
                        <td>{user.email}</td>
                        <td>{user.permission_name || '-'}</td>
                        <td>
                          <div className="d-flex">
                            <Link to={`/user/update/${user._id}`} className="btn btn-success mr-1">Update</Link>
                            <button onClick={() => handleDelete(user)} className="btn btn-danger">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination filter={filter} onPageChange={onPageChange} totalPage={totalPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
