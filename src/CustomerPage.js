import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Container, Typography, TextField, Button, Select, MenuItem,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, 
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, 
  InputLabel, FormControl, Box, Paper, Alert, Snackbar, Chip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, Search, Refresh, Delete, Edit } from '@mui/icons-material';

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    fromDate: null,
    toDate: null
  });
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    source: 'Other',
    currentLocation: '',
    desiredDestination: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.source) params.append('source', filters.source);
      if (filters.fromDate) params.append('fromDate', format(filters.fromDate, 'yyyy-MM-dd'));
      if (filters.toDate) params.append('toDate', format(filters.toDate, 'yyyy-MM-dd'));

      const response = await fetch(`http://localhost:5000/api/customers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const showError = (message) => {
    setError(message);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate all mandatory fields
    if (!formData.customerName.trim()) {
      showError('Customer name is required');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      showError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!/^\d{10,15}$/.test(formData.phone)) {
      showError('Phone number must be 10-15 digits');
      setLoading(false);
      return;
    }

    if (!formData.currentLocation.trim()) {
      showError('Current location is required');
      setLoading(false);
      return;
    }

    if (!formData.desiredDestination.trim()) {
      showError('Desired destination is required');
      setLoading(false);
      return;
    }

    try {
      const url = editingId 
        ? `http://localhost:5000/api/customers/${editingId}`
        : 'http://localhost:5000/api/customers';

      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? formData : { ...formData, customerId: generateCustomerId() };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');

      fetchCustomers();
      setOpenDialog(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerId = () => {
    return 'CUST-' + Date.now().toString().slice(-6);
  };

  const handleEdit = (customer) => {
    setFormData({
      customerName: customer.customerName,
      phone: customer.phone,
      source: customer.source,
      currentLocation: customer.currentLocation,
      desiredDestination: customer.desiredDestination
    });
    setEditingId(customer._id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete customer');
        
        fetchCustomers();
      } catch (err) {
        showError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      phone: '',
      source: 'Other',
      currentLocation: '',
      desiredDestination: ''
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      source: '',
      fromDate: null,
      toDate: null
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Header and Filters */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Customer Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add Customer
          </Button>
        </Box>

        {/* Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
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
            label="From Date"
            value={filters.fromDate}
            onChange={(newValue) => setFilters({...filters, fromDate: newValue})}
            renderInput={(params) => <TextField {...params} size="small" sx={{ width: 180 }} />}
          />

          <DatePicker
            label="To Date"
            value={filters.toDate}
            onChange={(newValue) => setFilters({...filters, toDate: newValue})}
            renderInput={(params) => <TextField {...params} size="small" sx={{ width: 180 }} />}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={resetFilters}
            sx={{ height: 40 }}
          >
            Reset
          </Button>
        </Box>

        {/* Customer Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Current Location</TableCell>
                <TableCell>Desired Destination</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No customers found</TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.customerName}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.source}
                        sx={{ 
                          backgroundColor: getSourceColor(customer.source),
                          color: 'white',
                          minWidth: 100
                        }}
                      />
                    </TableCell>
                    <TableCell>{customer.currentLocation}</TableCell>
                    <TableCell>{customer.desiredDestination}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(customer)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(customer._id)}
                        color="error"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Customer Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit' : 'Add'} Customer</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name *"
                    fullWidth
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    required
                    error={!formData.customerName.trim()}
                    helperText={!formData.customerName.trim() ? "Required field" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number *"
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    inputProps={{ pattern: "[0-9]{10,15}" }}
                    required
                    error={!formData.phone.trim() || !/^\d{10,15}$/.test(formData.phone)}
                    helperText={
                      !formData.phone.trim() ? "Required field" :
                      !/^\d{10,15}$/.test(formData.phone) ? "Must be 10-15 digits" : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Source *</InputLabel>
                    <Select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      label="Source"
                      error={!formData.source}
                    >
                      <MenuItem value="Facebook">Facebook</MenuItem>
                      <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                      <MenuItem value="TikTok">TikTok</MenuItem>
                      <MenuItem value="Reference">Reference</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current Location *"
                    fullWidth
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                    required
                    error={!formData.currentLocation.trim()}
                    helperText={!formData.currentLocation.trim() ? "Required field" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Desired Destination *"
                    fullWidth
                    value={formData.desiredDestination}
                    onChange={(e) => setFormData({...formData, desiredDestination: e.target.value})}
                    required
                    error={!formData.desiredDestination.trim()}
                    helperText={!formData.desiredDestination.trim() ? "Required field" : ""}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default CustomerPage;