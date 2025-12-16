import { useContext, useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import PerfectScrollbar from 'perfect-scrollbar';
import { AuthContext } from '../context/Auth';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

const MENU = [
  { label: 'Customer', permission: 'Nhân Viên', path: '/customer' },
  { label: 'Coupon', permission: 'Nhân Viên', path: '/coupon' },
  { label: 'Product', permission: 'Nhân Viên', path: '/product' },
  { label: 'Sale', permission: 'Nhân Viên', path: '/sale' },
  { label: 'Category', permission: 'Nhân Viên', path: '/category' },
  { label: 'Order', permission: 'Nhân Viên', path: '/order' },
  { label: 'ConfirmOrder', permission: 'Nhân Viên', path: '/confirmorder' },
  { label: 'Delivery', permission: 'Nhân Viên', path: '/delivery' },
  { label: 'ConfirmDelivery', permission: 'Nhân Viên', path: '/confirmdelivery' },
  { label: 'CompletedOrder', permission: 'Nhân Viên', path: '/completedorder' },
  { label: 'CancelOrder', permission: 'Nhân Viên', path: '/cancelorder' },
  { label: 'User', permission: 'Admin', path: '/user' },
  { label: 'Permission', permission: 'Admin', path: '/permission' },
];

function Menu({ collapsed }) {
  const { user } = useContext(AuthContext);
  const sidebarRef = useRef(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!user || !sidebarRef.current) return;

    const ps = new PerfectScrollbar(sidebarRef.current);

    return () => {
      ps.destroy();
    };
  }, [user]);

  if (!user) return null;

  const role =
    user.id_permission === 1
      ? 'Admin'
      : user.id_permission === 2
      ? 'Nhân Viên'
      : '';

  return (
    <aside className={`left-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="scroll-sidebar" ref={sidebarRef}>
        <nav className="sidebar-nav">
          <ul className="sidebar-nav">
            <li className="nav-small-cap">Components</li>

            <li className={`sidebar-item ${open ? 'active' : ''}`}>
              <div
                className="sidebar-link"
                onClick={() => setOpen(!open)}
                style={{ cursor: 'pointer' }}
              >
                <i className="mdi mdi-grid"></i>
                <span>Tables</span>
              </div>

              {open && (
                <ul className="first-level">
                  {MENU.filter(m => m.permission === role).map(m => (
                    <li key={m.path} className="sidebar-item">
                      <NavLink
                        to={m.path}
                        className="sidebar-link"
                        activeClassName="active"
                      >
                        {m.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Menu;
