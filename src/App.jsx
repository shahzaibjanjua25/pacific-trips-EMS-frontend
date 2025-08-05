import React, { useState } from 'react';
import EmployeePage from './EmployeePage';
import CustomerPage from './CustomerPage';
import LeadManagement from './LeadManagement';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { 
  IconButton, 
  AppBar,
  Tabs,
  Tab,
} from '@mui/material';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
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
          {/* Employees Tab */}
          <li style={{ marginBottom: 12 }}>
            <div 
              onClick={() => setActiveTab(0)}
              style={{
                display: 'block',
                padding: '10px 12px',
                color: activeTab === 0 ? '#1976d2' : '#424242',
                textDecoration: 'none',
                borderRadius: 4,
                transition: 'all 0.2s ease',
                fontWeight: 500,
                opacity: sidebarOpen ? 1 : 0,
                backgroundColor: activeTab === 0 ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              Employees
            </div>
          </li>
          
          {/* Customer List Tab */}
          <li style={{ marginBottom: 12 }}>
            <div 
              onClick={() => setActiveTab(1)}
              style={{
                display: 'block',
                padding: '10px 12px',
                color: activeTab === 1 ? '#1976d2' : '#424242',
                textDecoration: 'none',
                borderRadius: 4,
                transition: 'all 0.2s ease',
                fontWeight: 500,
                opacity: sidebarOpen ? 1 : 0,
                backgroundColor: activeTab === 1 ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              Customer List
            </div>
          </li>
          
          {/* Lead Management Tab */}
          <li style={{ marginBottom: 12 }}>
            <div 
              onClick={() => setActiveTab(2)}
              style={{
                display: 'block',
                padding: '10px 12px',
                color: activeTab === 2 ? '#1976d2' : '#424242',
                textDecoration: 'none',
                borderRadius: 4,
                transition: 'all 0.2s ease',
                fontWeight: 500,
                opacity: sidebarOpen ? 1 : 0,
                backgroundColor: activeTab === 2 ? 'rgba(25, 118, 210, 0.15)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              Lead Management
            </div>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
        transition: 'margin-left 0.3s ease'
      }}>
        <AppBar 
          position="static" 
          color="default"
          elevation={0}
          style={{ 
            backgroundColor: 'white',
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
            marginBottom: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!sidebarOpen && (
              <IconButton 
                onClick={toggleSidebar}
                style={{
                  marginRight: 16,
                  backgroundColor: 'white',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Employees" />
              <Tab label="Customer List" />
              <Tab label="Lead Management" />
            </Tabs>
          </div>
        </AppBar>
        
        <div style={{ padding: '0 24px' }}>
          {activeTab === 0 && <EmployeePage />}
          {activeTab === 1 && <CustomerPage />}
          {activeTab === 2 && <LeadManagement />}
        </div>
      </div>
    </div>
  );
}

export default App;