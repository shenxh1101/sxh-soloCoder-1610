import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import styles from './App.module.css'
import OrderManagement from './pages/OrderManagement'
import Statistics from './pages/Statistics'
import OrderDetail from './pages/OrderDetail'
import { useAppStore } from './store'

const menuItems = [
  { key: 'orders', label: '工单管理', icon: '📋', path: '/orders' },
  { key: 'statistics', label: '统计报表', icon: '📊', path: '/statistics' }
]

function Sidebar() {
  const location = useLocation()
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🏠</span>
        <span className={styles.logoText}>物业报修管理</span>
      </div>
      <nav className={styles.menu}>
        {menuItems.map(item => (
          <a
            key={item.key}
            href={item.path}
            className={classNames(
              styles.menuItem,
              location.pathname.startsWith(item.path) && styles.menuItemActive
            )}
            onClick={(e) => {
              e.preventDefault()
              window.history.pushState({}, '', item.path)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          >
            <span className={styles.menuIcon}>{item.icon}</span>
            <span className={styles.menuLabel}>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Header() {
  const { currentUser } = useAppStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>工单管理系统</h1>
      </div>
      <div className={styles.headerRight}>
        <div 
          className={styles.userInfo}
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <img src={currentUser.avatar} alt="" className={styles.userAvatar} />
          <span className={styles.userName}>{currentUser.name}</span>
          <span className={styles.userRole}>管理员</span>
        </div>
      </div>
    </header>
  )
}

function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
