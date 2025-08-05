import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EmployeePage from './EmployeePage';
import CustomerPage from './CustomerPage';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { IconButton } from '@mui/material';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 240 : 0,
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '2px 0 4px -1px rgba(0,0,0,0.1), 4px 0 5px 0px rgba(0,0,0,0.07), 1px 0 10px 0px rgba(0,0,0,0.06)',
          padding: sidebarOpen ? 24 : 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          overflow: 'hidden',
          transition: 'width 0.3s ease, padding 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: '1px solid #e0e0e0',
            minWidth: 240
          }}>
            <h3 style={{
              color: '#1976d2',
              fontWeight: 500,
              margin: 0,
              opacity: sidebarOpen ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>Navigation</h3>
            <IconButton onClick={toggleSidebar} size="small">
              <ChevronLeftIcon style={{
                transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s ease'
              }} />
            </IconButton>
          </div>
          
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0,
            minWidth: 240
          }}>
            <li style={{ marginBottom: 12 }}>
              <Link 
                to="/" 
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  color: '#424242',
                  textDecoration: 'none',
                  borderRadius: 4,
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                  opacity: sidebarOpen ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                activeStyle={{
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                  color: '#1976d2'
                }}
              >
                Employees
              </Link>
            </li>
            <li style={{ marginBottom: 12 }}>
              <Link 
                to="/customers" 
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  color: '#424242',
                  textDecoration: 'none',
                  borderRadius: 4,
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                  opacity: sidebarOpen ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                activeStyle={{
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                  color: '#1976d2'
                }}
              >
                Customers
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ 
          flex: 1,
          padding: 24,
          backgroundColor: '#f5f7fa',
          transition: 'margin-left 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 24
          }}>
            {!sidebarOpen && (
              <IconButton 
                onClick={toggleSidebar}
                style={{
                  marginRight: 16,
                  backgroundColor: 'white',
                  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)'
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </div>
          
          <Routes>
            <Route path="/" element={<EmployeePage />} />
            <Route path="/customers" element={<CustomerPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;