import React, { useContext, useState } from 'react';
import Logoicon from '../Image/logo-icon.png';
import Logotext from '../Image/logo-text.png';
import Logolight from '../Image/logo-light-text.png';
import { AuthContext } from '../context/Auth';

function Header({ onToggleSidebar }) {
    const { jwt, user, logOut } = useContext(AuthContext);
    const [openUser, setOpenUser] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);

    if (!jwt || !user) return null;

    return (
        <header className="topbar">
            <nav className="navbar top-navbar navbar-expand-md">
                {/* LOGO */}
                <div className="navbar-header">
                    <button
                        className="nav-toggler d-md-none"
                        onClick={onToggleSidebar}
                    >
                        ☰
                    </button>

                    <div className="navbar-brand">
                        <b className="logo-icon">
                            <img src={Logoicon} alt="logo" />
                        </b>
                        <span className="logo-text">
                            <img src={Logotext} alt="logo" className="dark-logo" />
                            <img src={Logolight} alt="logo" className="light-logo" />
                        </span>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="navbar-collapse d-flex justify-content-between px-3">
                    {/* SETTINGS */}
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <button
                                className="nav-link btn"
                                onClick={() => setOpenSetting(!openSetting)}
                            >
                                ⚙️
                            </button>

                            {openSetting && (
                                <div className="dropdown-menu show">
                                    <button className="dropdown-item">Action</button>
                                    <button className="dropdown-item">Another action</button>
                                </div>
                            )}
                        </li>
                    </ul>

                    {/* USER */}
                    <ul className="navbar-nav">
                        <li className="nav-item dropdown">
                            <button
                                className="nav-link btn"
                                onClick={() => setOpenUser(!openUser)}
                            >
                                Hello, <b>{user.fullname}</b> ⌄
                            </button>

                            {openUser && (
                                <div className="dropdown-menu dropdown-menu-right show">
                                    <button
                                        className="dropdown-item"
                                        onClick={logOut}
                                    >
                                        🔌 Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}

export default Header;
