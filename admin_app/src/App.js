import React, { useContext } from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import AuthContextProvider, { AuthContext } from './component/context/Auth';

import Header from './component/Shared/Header';
import Menu from './component/Shared/Menu';

import Login from './component/Login/Login';
import NotFound from './component/NotFound/NotFound';

import User from './component/User/User';
import CreateUser from './component/User/CreateUser';

import UserCus from './component/UserCus/UserCus';
import Product from './component/Product/Product';


function AppContent() {
  const { jwt } = useContext(AuthContext);

  return (
    <>
      {/* HEADER + MENU chỉ khi login */}
      {jwt && (
        <>
          <Header />
          <Menu />
        </>
      )}

     <Switch>
  {/* LOGIN */}
  <Route exact path="/">
    {!jwt ? <Login /> : <Redirect to="/user" />}
  </Route>

  {/* ADMIN ROUTES */}
  <Route exact path="/user">
    {jwt ? <User /> : <Redirect to="/" />}
  </Route>
  <Route exact path="/user/create">
    {jwt ? <CreateUser /> : <Redirect to="/" />}
  </Route>
  <Route exact path="/customer">
    {jwt ? <UserCus /> : <Redirect to="/" />}
  </Route>
  <Route exact path="/product">
    {jwt ? <Product /> : <Redirect to="/" />}
  </Route>

  {/* 404 */}
  <Route>
    <NotFound />
  </Route>
</Switch>

    </>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthContextProvider>
  );
}

export default App;
