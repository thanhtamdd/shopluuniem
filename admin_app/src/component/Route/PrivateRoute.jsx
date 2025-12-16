import { Route, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/Auth';

function PrivateRoute({ component: Component, permission, ...rest }) {
  const { jwt, user } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        // ❌ Chưa login
        if (!jwt || !user) {
          return <Redirect to="/" />;
        }

        // ❌ Sai quyền
        if (permission && user.id_permission.permission !== permission) {
          return <Redirect to="/" />;
        }

        // ✅ OK
        return <Component {...props} />;
      }}
    />
  );
}

export default PrivateRoute;
