import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './customer.css';
import {
  Typography, TextField, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle,
  DialogContent, DialogActions, InputLabel, FormControl, Box,
  CircularProgress, TablePagination, Tooltip, IconButton, Grid
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, Edit, Delete } from '@mui/icons-material';

function LeadManagement() {
  // State
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    fromDate: null,
    toDate: null
  });
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
  const [openDialog, setOpenDialog] = useState(false);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [confirmationAmount, setConfirmationAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (filters.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters.toDate) params.append('toDate', filters.toDate.toISOString());

      const response = await fetch(`http://localhost:5000/api/leads?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setLeads(data.data || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  // Handle confirmed status with amount
  const handleConfirmedSubmit = async () => {
    const parsedAmount = parseFloat(confirmationAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Update lead status
      const leadResponse = await fetch(`http://localhost:5000/api/leads/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'confirmed' })
      });

      if (!leadResponse.ok) {
        const errorData = await leadResponse.json();
        throw new Error(errorData.message || 'Failed to update lead status');
      }

      // Update employee amount using empId
      const employeeResponse = await fetch(`http://localhost:5000/api/employees/${formData.employeeId}/add-amount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount })
      });

      const employeeData = await employeeResponse.json();
      if (!employeeResponse.ok) {
        throw new Error(employeeData.message || 'Failed to update employee amount');
      }

      // Success
      setAmountDialogOpen(false);
      setConfirmationAmount('');
      fetchLeads();
      setOpenDialog(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error confirming lead:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status change handler
  const handleStatusChange = (e) => {
    if (e.target.value === 'confirmed') {
      setAmountDialogOpen(true);
      setFormData({...formData, status: 'Pending'});
    } else {
      setFormData({...formData, status: e.target.value});
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.status === 'confirmed') {
      setAmountDialogOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = editingId
        ? `http://localhost:5000/api/leads/${editingId}`
        : 'http://localhost:5000/api/leads';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      if (data.success) {
        fetchLeads();
        setOpenDialog(false);
        setEditingId(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error submitting lead:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit lead
  const handleEdit = (lead) => {
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
    setEditingId(lead._id);
    setOpenDialog(true);
  };

  // Delete lead
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete lead');
        fetchLeads();
      } catch (err) {
        setError(err.message);
        console.error('Error deleting lead:', err);
      }
    }
  };

  // Reset form
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
    setEditingId(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      fromDate: null,
      toDate: null
    });
  };

  // Pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      'Paid': '#4caf50',
      'confirmed': '#4caf50',
      'Pending': '#ff9800',
      'Willing': '#2196f3',
      'Lost': '#f44336',
      'refund': '#9e9e9e',
      'Contacted': '#00bcd4'
    };
    return colors[status] || '#000000';
  };

  const getSourceColor = (source) => {
    const colors = {
      'Facebook': '#4267B2',
      'WhatsApp': '#25D366',
      'TikTok': '#000000',
      'Reference': '#FFA500',
      'Other': '#808080'
    };
    return colors[source] || '#808080';
  };

  // Filter leads
  const filteredLeads = leads.filter(lead =>
    lead.employeeName?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lead.customerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lead.employeeId?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lead.customerId?.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="customer-container">
        <Typography variant="h4" className="customer-header">
          Lead Management
        </Typography>

        {error && <div className="error-state">{error}</div>}

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-row">
            <TextField
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              size="small"
              sx={{ minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
                <MenuItem value="Willing">Willing</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                label="Source"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Facebook">Facebook</MenuItem>
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="TikTok">TikTok</MenuItem>
                <MenuItem value="Reference">Reference</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="From"
              value={filters.fromDate}
              onChange={(date) => setFilters({ ...filters, fromDate: date })}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 180 }} />}
            />

            <DatePicker
              label="To"
              value={filters.toDate}
              onChange={(date) => setFilters({ ...filters, toDate: date })}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: 180 }} />}
            />

            <Button
              onClick={resetFilters}
              variant="outlined"
              color="secondary"
              disabled={loading}
              sx={{ height: '40px' }}
            >
              Reset Filters
            </Button>

            <Button
              onClick={() => { resetForm(); setOpenDialog(true); }}
              variant="contained"
              disabled={loading}
              sx={{ height: '40px' }}
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <CircularProgress />
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            No leads found
          </div>
        ) : (
          <>
            <Table className="customer-table">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Customer Contact</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Date Added</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeads
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(lead => (
                    <TableRow key={lead._id} hover>
                      <TableCell>{lead.employeeId}</TableCell>
                      <TableCell>{lead.employeeName}</TableCell>
                      <TableCell>{lead.customerName}</TableCell>
                      <TableCell>{lead.customerContactNo}</TableCell>
                      <TableCell>{lead.desiredDestination}</TableCell>
                      <TableCell>
                        <Box sx={{ color: getStatusColor(lead.status), fontWeight: 500 }}>
                          {lead.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          backgroundColor: getSourceColor(lead.source),
                          color: 'white',
                          borderRadius: '16px',
                          padding: '4px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '80px',
                          fontSize: '0.8125rem',
                          fontWeight: 500
                        }}>
                          {lead.source}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {lead.dateSource ? format(new Date(lead.dateSource), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="action-buttons">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEdit(lead)} disabled={loading}>
                              <Edit color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(lead._id)} disabled={loading}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredLeads.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {/* Lead Form Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => { setOpenDialog(false); resetForm(); }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingId ? 'Edit' : 'Add'} Lead</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee Lead ID"
                    fullWidth
                    value={formData.employeeLeadId}
                    onChange={(e) => setFormData({ ...formData, employeeLeadId: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee ID"
                    fullWidth
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    margin="normal"
                    required
                    disabled={!!editingId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee Name"
                    fullWidth
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Employee Contact"
                    fullWidth
                    value={formData.employeeContactNo}
                    onChange={(e) => setFormData({ ...formData, employeeContactNo: e.target.value })}
                    margin="normal"
                    helperText="10-15 digits"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Name"
                    fullWidth
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer ID"
                    fullWidth
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Customer Contact"
                    fullWidth
                    value={formData.customerContactNo}
                    onChange={(e) => setFormData({ ...formData, customerContactNo: e.target.value })}
                    margin="normal"
                    required
                    helperText="10-15 digits"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Current Address"
                    fullWidth
                    value={formData.currentAddress}
                    onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                    margin="normal"
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Desired Destination"
                    fullWidth
                    value={formData.desiredDestination}
                    onChange={(e) => setFormData({ ...formData, desiredDestination: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                      <MenuItem value="Lost">Lost</MenuItem>
                      <MenuItem value="Willing">Willing</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="refund">Refund</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Source</InputLabel>
                    <Select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenDialog(false); resetForm(); }} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Amount Confirmation Dialog */}
        <Dialog open={amountDialogOpen} onClose={() => setAmountDialogOpen(false)}>
          <DialogTitle>Confirm Lead Completion</DialogTitle>
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
    </LocalizationProvider>
  );
}

export default LeadManagement;