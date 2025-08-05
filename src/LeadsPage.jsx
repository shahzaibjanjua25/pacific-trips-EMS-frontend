import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddLead from './pages/AddLead';
import ViewLeads from './pages/ViewLeads';
import './App.css';

function LeadsPage() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-lead" element={<AddLead />} />
            <Route path="/view-leads" element={<ViewLeads />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default LeadsPage;