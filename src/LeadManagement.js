import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Typography, TextField, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, CircularProgress, Box,
  TableSortLabel, IconButton, Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

function LeadManagement() {
  // State
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    selectedEmployee: '',
    selectedCustomer: '',
    status: 'Pending',
    phoneNo: '',
    desiredDestination: '',
    source: 'Other'
  });
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [confirmationAmount, setConfirmationAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sorting
  const [orderBy, setOrderBy] = useState('dateSource');
  const [order, setOrder] = useState('desc');
  const [activeSortColumn, setActiveSortColumn] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadsRes, empRes, custRes] = await Promise.all([
          fetch('http://localhost:5000/api/leads'),
          fetch('http://localhost:5000/api/employees'),
          fetch('http://localhost:5000/api/customers')
        ]);

        const leadsData = await leadsRes.json();
        const empData = await empRes.json();
        const custData = await custRes.json();

        setLeads(leadsData.data || leadsData);
        setEmployees(empData.data || empData);
        setCustomers(custData.data || custData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle sort request
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setActiveSortColumn(property);
  };

  // Sort leads
  const sortedLeads = [...leads].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle status change
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const isChangingFromConfirmed = formData.status === 'confirmed' && newStatus !== 'confirmed';
    const isChangingToConfirmed = newStatus === 'confirmed';
    
    if (isChangingToConfirmed || isChangingFromConfirmed) {
      setAmountDialogOpen(true);
      setFormData({...formData, status: newStatus});
    } else {
      setFormData({...formData, status: newStatus});
    }
  };

  // Handle confirmed lead with amount
  const handleConfirmedSubmit = async () => {
    const parsedAmount = parseFloat(confirmationAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Find selected records
      const selectedEmp = employees.find(e => 
        `${e.empId} - ${e.empName}` === formData.selectedEmployee
      );
      const selectedCust = customers.find(c => 
        `${c.customerId} - ${c.customerName}` === formData.selectedCustomer
      );

      if (!selectedEmp || !selectedCust) {
        throw new Error('Please select both employee and customer');
      }

      // Determine if we're adding or subtracting amount
      const isSubtracting = formData.status !== 'confirmed';
      const amount = isSubtracting ? -parsedAmount : parsedAmount;

      // Prepare lead data
      const leadData = {
        employeeLeadId: `${selectedEmp.empId}-${selectedCust.customerId}`,
        employeeId: selectedEmp.empId,
        employeeName: selectedEmp.empName,
        employeeContactNo: selectedEmp.phoneNo,
        customerId: selectedCust.customerId,
        customerName: selectedCust.customerName,
        customerContactNo: formData.phoneNo || selectedCust.phone,
        currentAddress: selectedCust.currentLocation,
        desiredDestination: formData.desiredDestination || selectedCust.desiredDestination,
        status: formData.status,
        source: formData.source || selectedCust.source,
        dateSource: new Date()
      };

      // API call to update lead
      const url = editingId 
        ? `http://localhost:5000/api/leads/${editingId}`
        : 'http://localhost:5000/api/leads';
      const method = editingId ? 'PUT' : 'POST';

      const leadResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!leadResponse.ok) {
        const errorData = await leadResponse.json();
        throw new Error(errorData.message || 'Failed to update lead');
      }

      // Update employee amount
      const employeeResponse = await fetch(
        `http://localhost:5000/api/employees/${selectedEmp.empId}/add-amount`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        }
      );

      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.message || 'Failed to update employee amount');
      }

      // Update customer data if editing
      if (editingId) {
        const customerResponse = await fetch(
          `http://localhost:5000/api/customers/${selectedCust.customerId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: formData.phoneNo || selectedCust.phone,
              desiredDestination: formData.desiredDestination || selectedCust.desiredDestination,
              source: formData.source || selectedCust.source
            })
          }
        );

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json();
          throw new Error(errorData.message || 'Failed to update customer');
        }
      }

      // Refresh all data
      const [leadsRes, empRes, custRes] = await Promise.all([
        fetch('http://localhost:5000/api/leads'),
        fetch('http://localhost:5000/api/employees'),
        fetch('http://localhost:5000/api/customers')
      ]);

      const leadsData = await leadsRes.json();
      const empData = await empRes.json();
      const custData = await custRes.json();

      setLeads(leadsData.data || leadsData);
      setEmployees(empData.data || empData);
      setCustomers(custData.data || custData);

      // Reset form
      setAmountDialogOpen(false);
      setConfirmationAmount('');
      setOpenDialog(false);
      setEditingId(null);
      setFormData({
        selectedEmployee: '',
        selectedCustomer: '',
        status: 'Pending',
        phoneNo: '',
        desiredDestination: '',
        source: 'Other'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Regular form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.status === 'confirmed') {
      setAmountDialogOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find selected records
      const selectedEmp = employees.find(e => 
        `${e.empId} - ${e.empName}` === formData.selectedEmployee
      );
      const selectedCust = customers.find(c => 
        `${c.customerId} - ${c.customerName}` === formData.selectedCustomer
      );

      if (!selectedEmp || !selectedCust) {
        throw new Error('Please select both employee and customer');
      }

      // Prepare lead data
      const leadData = {
        employeeLeadId: `${selectedEmp.empId}-${selectedCust.customerId}`,
        employeeId: selectedEmp.empId,
        employeeName: selectedEmp.empName,
        employeeContactNo: selectedEmp.phoneNo,
        customerId: selectedCust.customerId,
        customerName: selectedCust.customerName,
        customerContactNo: formData.phoneNo || selectedCust.phone,
        currentAddress: selectedCust.currentLocation,
        desiredDestination: selectedCust.desiredDestination,
        status: formData.status,
        source: selectedCust.source,
        dateSource: new Date()
      };

      // API call
      const url = editingId 
        ? `http://localhost:5000/api/leads/${editingId}`
        : 'http://localhost:5000/api/leads';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      // Refresh data
      const leadsRes = await fetch('http://localhost:5000/api/leads');
      const leadsData = await leadsRes.json();
      setLeads(leadsData.data || leadsData);

      // Reset form
      setOpenDialog(false);
      setEditingId(null);
      setFormData({
        selectedEmployee: '',
        selectedCustomer: '',
        status: 'Pending',
        phoneNo: '',
        desiredDestination: '',
        source: 'Other'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit lead
  const handleEdit = (lead) => {
    const emp = employees.find(e => e.empId === lead.employeeId);
    const cust = customers.find(c => c.customerId === lead.customerId);
    
    if (emp && cust) {
      setFormData({
        selectedEmployee: `${emp.empId} - ${emp.empName}`,
        selectedCustomer: `${cust.customerId} - ${cust.customerName}`,
        status: lead.status,
        phoneNo: lead.customerContactNo,
        desiredDestination: lead.desiredDestination,
        source: lead.source
      });
      setEditingId(lead._id);
      setOpenDialog(true);
    } else {
      setError('Employee or customer not found');
    }
  };

  // Delete lead
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete lead');
        
        // Refresh data
        const leadsRes = await fetch('http://localhost:5000/api/leads');
        const leadsData = await leadsRes.json();
        setLeads(leadsData.data || leadsData);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lead Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Lead
        </Button>
      </Box>

      {error && <Box color="error.main" mb={2}>{error}</Box>}

      {/* Leads Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={activeSortColumn === 'employeeId'}
                direction={orderBy === 'employeeId' ? order : 'asc'}
                onClick={() => handleSort('employeeId')}
              >
                Employee
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={activeSortColumn === 'customerId'}
                direction={orderBy === 'customerId' ? order : 'asc'}
                onClick={() => handleSort('customerId')}
              >
                Customer
              </TableSortLabel>
            </TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>
              <TableSortLabel
                active={activeSortColumn === 'status'}
                direction={orderBy === 'status' ? order : 'asc'}
                onClick={() => handleSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={activeSortColumn === 'dateSource'}
                direction={orderBy === 'dateSource' ? order : 'asc'}
                onClick={() => handleSort('dateSource')}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : sortedLeads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            sortedLeads.map(lead => (
              <TableRow key={lead._id} hover>
                <TableCell>{lead.employeeId} - {lead.employeeName}</TableCell>
                <TableCell>{lead.customerId} - {lead.customerName}</TableCell>
                <TableCell>{lead.customerContactNo}</TableCell>
                <TableCell>{lead.desiredDestination}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.status}</TableCell>
                <TableCell>{format(new Date(lead.dateSource), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(lead)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(lead._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit' : 'Add'} Lead</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ padding: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.selectedEmployee}
                  onChange={(e) => setFormData({...formData, selectedEmployee: e.target.value})}
                  label="Employee"
                  required
                >
                  {employees.map(emp => (
                    <MenuItem key={emp._id} value={`${emp.empId} - ${emp.empName}`}>
                      {`${emp.empId} - ${emp.empName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.selectedCustomer}
                  onChange={(e) => setFormData({...formData, selectedCustomer: e.target.value})}
                  label="Customer"
                  required
                >
                  {customers.map(cust => (
                    <MenuItem key={cust._id} value={`${cust.customerId} - ${cust.customerName}`}>
                      {`${cust.customerId} - ${cust.customerName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {editingId && (
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Customer Phone"
                    value={formData.phoneNo}
                    onChange={(e) => setFormData({...formData, phoneNo: e.target.value})}
                    required
                  />

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Destination"
                    value={formData.desiredDestination}
                    onChange={(e) => setFormData({...formData, desiredDestination: e.target.value})}
                    required
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Source</InputLabel>
                    <Select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      label="Source"
                      required
                    >
                      <MenuItem value="Facebook">Facebook</MenuItem>
                      <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                      <MenuItem value="Reference">Reference</MenuItem>
                      <MenuItem value="TikTok">TikTok</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Status"
                  required
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="Lost">Lost</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Amount Confirmation Dialog */}
      <Dialog open={amountDialogOpen} onClose={() => setAmountDialogOpen(false)}>
        <DialogTitle>
          {formData.status === 'confirmed' 
            ? 'Confirm Lead Completion' 
            : 'Adjust Employee Amount'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (Rs.)"
            type="number"
            fullWidth
            value={confirmationAmount}
            onChange={(e) => setConfirmationAmount(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
          />
          <Typography variant="body2" color="textSecondary" mt={1}>
            {formData.status === 'confirmed'
              ? 'This amount will be added to employee\'s achieved amount'
              : 'This amount will be subtracted from employee\'s achieved amount'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAmountDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmedSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LeadManagement;