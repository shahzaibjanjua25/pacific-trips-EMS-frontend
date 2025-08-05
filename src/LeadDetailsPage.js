// src/components/LeadManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    employeeLeadId: '',
    employeeId: '',
    employeeName: '',
    employeeContactNo: '',
    customerName: '',
    customerId: '',
    customerContactNo: '',
    currentAddress: '',
    desiredDestination: '',
    status: 'Pending',
    source: 'Other'
  });

  // Fetch leads from backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get('/api/leads');
        setLeads(response.data);
      } catch (error) {
        showSnackbar('Failed to fetch leads', 'error');
      }
    };
    fetchLeads();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLead = async () => {
    try {
      const response = await axios.post('/api/leads', formData);
      setLeads([...leads, response.data]);
      showSnackbar('Lead added successfully', 'success');
      setOpenAddDialog(false);
      resetForm();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to add lead', 'error');
    }
  };

  const handleEditLead = async () => {
    try {
      const response = await axios.put(`/api/leads/${currentLead._id}`, formData);
      setLeads(leads.map(lead => lead._id === currentLead._id ? response.data : lead));
      showSnackbar('Lead updated successfully', 'success');
      setOpenEditDialog(false);
      resetForm();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update lead', 'error');
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await axios.delete(`/api/leads/${id}`);
      setLeads(leads.filter(lead => lead._id !== id));
      showSnackbar('Lead deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete lead', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeLeadId: '',
      employeeId: '',
      employeeName: '',
      employeeContactNo: '',
      customerName: '',
      customerId: '',
      customerContactNo: '',
      currentAddress: '',
      desiredDestination: '',
      status: 'Pending',
      source: 'Other'
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const openEditModal = (lead) => {
    setCurrentLead(lead);
    setFormData({
      employeeLeadId: lead.employeeLeadId,
      employeeId: lead.employeeId,
      employeeName: lead.employeeName,
      employeeContactNo: lead.employeeContactNo,
      customerName: lead.customerName,
      customerId: lead.customerId,
      customerContactNo: lead.customerContactNo,
      currentAddress: lead.currentAddress,
      desiredDestination: lead.desiredDestination,
      status: lead.status,
      source: lead.source
    });
    setOpenEditDialog(true);
  };

  const filteredLeads = leads.filter(lead =>
    lead.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Lead Management</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <TextField
          label="Search by Employee or Customer Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add New Lead
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Contact</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>{lead.employeeId}</TableCell>
                <TableCell>{lead.employeeName}</TableCell>
                <TableCell>{lead.customerName}</TableCell>
                <TableCell>{lead.customerContactNo}</TableCell>
                <TableCell>{lead.desiredDestination}</TableCell>
                <TableCell>{lead.status}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEditModal(lead)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteLead(lead._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Lead Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
            <TextField
              label="Employee Lead ID"
              name="employeeLeadId"
              value={formData.employeeLeadId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee Name"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee Contact No"
              name="employeeContactNo"
              value={formData.employeeContactNo}
              onChange={handleInputChange}
              required
              helperText="10-15 digits only"
            />
            <TextField
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Customer ID"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Customer Contact No"
              name="customerContactNo"
              value={formData.customerContactNo}
              onChange={handleInputChange}
              required
              helperText="10-15 digits only"
            />
            <TextField
              label="Current Address"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
              required
              multiline
              rows={2}
            />
            <TextField
              label="Desired Destination"
              name="desiredDestination"
              value={formData.desiredDestination}
              onChange={handleInputChange}
              required
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              {['Pending', 'Contacted', 'Lost', 'Willing', 'Paid', 'refund', 'confirmed'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              required
            >
              {['Facebook', 'WhatsApp', 'Reference', 'TikTok', 'Other'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLead} color="primary" variant="contained">Add Lead</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
            <TextField
              label="Employee Lead ID"
              name="employeeLeadId"
              value={formData.employeeLeadId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee Name"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Employee Contact No"
              name="employeeContactNo"
              value={formData.employeeContactNo}
              onChange={handleInputChange}
              required
              helperText="10-15 digits only"
            />
            <TextField
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Customer ID"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Customer Contact No"
              name="customerContactNo"
              value={formData.customerContactNo}
              onChange={handleInputChange}
              required
              helperText="10-15 digits only"
            />
            <TextField
              label="Current Address"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
              required
              multiline
              rows={2}
            />
            <TextField
              label="Desired Destination"
              name="desiredDestination"
              value={formData.desiredDestination}
              onChange={handleInputChange}
              required
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              {['Pending', 'Contacted', 'Lost', 'Willing', 'Paid', 'refund', 'confirmed'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              required
            >
              {['Facebook', 'WhatsApp', 'Reference', 'TikTok', 'Other'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditLead} color="primary" variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LeadManagement;