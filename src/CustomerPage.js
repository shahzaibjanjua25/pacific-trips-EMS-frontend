import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './customer.css';
import {
  Container, Typography, TextField, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, InputLabel, FormControl, Box
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    fromDate: null,
    toDate: null
  });
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    source: 'Other',
    currentLocation: '',
    desiredDestination: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.source) params.append('source', filters.source);
      if (filters.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters.toDate) params.append('toDate', filters.toDate.toISOString());

      const response = await fetch(`http://localhost:5000/api/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
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
  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      source: '',
      fromDate: null,
      toDate: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = editingId
        ? `http://localhost:5000/api/customers/${editingId}`
        : 'http://localhost:5000/api/customers';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        setOpenDialog(false);
        setEditingId(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error submitting customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      customerId: customer.customerId,
      customerName: customer.customerName,
      source: customer.source,
      currentLocation: customer.currentLocation || '',
      desiredDestination: customer.desiredDestination || ''
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

        if (!response.ok) {
          throw new Error('Failed to delete customer');
        }

        fetchCustomers();
      } catch (err) {
        setError(err.message);
        console.error('Error deleting customer:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      source: 'Other',
      currentLocation: '',
      desiredDestination: ''
    });
    setEditingId(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="customer-container">
        <Typography variant="h4" className="customer-header">
          Customer Management
        </Typography>

        {/* Error display */}
        {error && (
          <div className="error-state">
            {error}
          </div>
        )}

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
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              variant="contained"
              disabled={loading}
              sx={{ height: '40px' }}
            >
              Add Customer
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            Loading...
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            No customers found
          </div>
        ) : (
          <Table className="customer-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Current Location</TableCell>
                <TableCell>Desired Destination</TableCell>
                <TableCell>Arrival Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c._id} hover>
                  <TableCell>{c.customerId}</TableCell>
                  <TableCell>{c.customerName}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: getSourceColor(c.source),
                        color: 'white',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '80px',
                        fontSize: '0.8125rem',
                        fontWeight: 500
                      }}
                    >
                      {c.source}
                    </Box>
                  </TableCell>
                  <TableCell>{c.currentLocation || '-'}</TableCell>
                  <TableCell>{c.desiredDestination || '-'}</TableCell>
                  <TableCell>{new Date(c.dateOfArrival).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      <Button
                        size="small"
                        onClick={() => handleEdit(c)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(c._id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Customer Form Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            resetForm();
          }}
          maxWidth="sm"
          fullWidth
          className="customer-dialog"
        >
          <DialogTitle className="customer-dialog-title">
            {editingId ? 'Edit' : 'Add'} Customer
          </DialogTitle>
          <DialogContent className="customer-dialog-content">
            <form onSubmit={handleSubmit} className="customer-form">
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Customer ID"
                    fullWidth
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    margin="normal"
                    disabled={!!editingId}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
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

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current Location"
                    fullWidth
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Desired Destination"
                    fullWidth
                    value={formData.desiredDestination}
                    onChange={(e) => setFormData({ ...formData, desiredDestination: e.target.value })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions className="customer-dialog-actions">
            <Button
              onClick={() => {
                setOpenDialog(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}

export default CustomerPage;