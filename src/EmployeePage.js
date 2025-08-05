import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Add, Search, Delete, Edit, Refresh, FilterList } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './styles.css';

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeLeadId: '',
    employeeId: '',
    employeeName: '',
    customerName: '',
    customerId: '',
    status: 'Active',
    source: 'Other'
  });
  const [filters, setFilters] = useState({
    searchText: '',
    status: '',
    source: '',
    fromDate: null,
    toDate: null
  });
  const [sortConfig, setSortConfig] = useState({ field: 'employeeName', direction: 'asc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');


  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/employees?';
      const params = new URLSearchParams();

      if (filters.searchText) params.append('search', filters.searchText);
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (filters.fromDate) {
        params.append('fromDate', format(filters.fromDate, 'yyyy-MM-dd') + 'T00:00:00.000Z');
      }
      if (filters.toDate) {
        params.append('toDate', format(filters.toDate, 'yyyy-MM-dd') + 'T23:59:59.999Z');
      }
      if (sortConfig.field) {
        params.append('sortBy', `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.field}`);
      }

      // console.log('Fetching with params:', params.toString()); // Debug output

      const response = await fetch(url + params.toString());
      const data = await response.json();

      // console.log('Response data:', data); // Debug output

      if (data.success) {
        setEmployees(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch employees');
      }
      const fullUrl = `http://localhost:5000/api/employees?${params.toString()}`;
    // console.log('Full URL:', fullUrl);
    
    // const response = await fetch(fullUrl);
    // const data = await response.json();

    setDebugInfo(JSON.stringify({
      url: fullUrl,
      filters,
      responseCount: data.count,
      sortConfig
    }, null, 2));

    if (data.success) {
      setEmployees(data.data);
    }
  // } catch (error) {
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      alert(`Error loading employees: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters, sortConfig]);
useEffect(() => {
  // console.log('Filters changed:', filters);
}, [filters]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      source: '',
      fromDate: null,
      toDate: null
    });
  };

  const handleEdit = (employee) => {
    setFormData({
      employeeLeadId: employee.employeeLeadId,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      customerName: employee.customerName,
      customerId: employee.customerId,
      status: employee.status,
      source: employee.source
    });
    setEditingId(employee._id);
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:5000/api/employees/${editingId}`
        : 'http://localhost:5000/api/employees';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      await fetchEmployees();
      handleClose();
      alert(`Employee ${editingId ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Operation failed: ${error.message}`);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      await fetchEmployees();
      alert('Employee deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      employeeLeadId: '',
      employeeId: '',
      employeeName: '',
      customerName: '',
      customerId: '',
      status: 'Active',
      source: 'Other'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'On Leave': return 'status-on-leave';
      case 'Terminated': return 'status-terminated';
      default: return '';
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="app-container">
        <AppBar position="fixed" className="app-bar">
          <Toolbar>
            <Typography variant="h6" className="app-title">
              Employee Management System
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" className="content-container">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className="paper-container">
                {/* Filter Bar */}
                <Box className="filter-container">
                  <TextField
                    className="search-field"
                    label="Search Employees"
                    variant="outlined"
                    size="small"
                    value={filters.searchText}
                    onChange={(e) => handleFilterChange('searchText', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: filters.searchText && (
                        <IconButton onClick={() => handleFilterChange('searchText', '')} size="small">
                          <Refresh fontSize="small" />
                        </IconButton>
                      )
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="On Leave">On Leave</MenuItem>
                      <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Source</InputLabel>
                    <Select
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
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
                    onChange={(newValue) => handleFilterChange('fromDate', newValue)}
                    renderInput={(params) => (
                      <TextField {...params} size="small" sx={{ width: 150 }} />
                    )}
                  />

                  <DatePicker
                    label="To Date"
                    value={filters.toDate}
                    onChange={(newValue) => handleFilterChange('toDate', newValue)}
                    renderInput={(params) => (
                      <TextField {...params} size="small" sx={{ width: 150 }} />
                    )}
                  />

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={resetFilters}
                    startIcon={<FilterList />}
                  >
                    Reset Filters
                  </Button>

                  <Button
                    className="add-button"
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Add Employee
                  </Button>
                </Box>

                <TableContainer className="table-container">
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'employeeLeadId'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('employeeLeadId')}
                          >
                            Lead ID
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'employeeId'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('employeeId')}
                          >
                            Employee ID
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'employeeName'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('employeeName')}
                          >
                            Employee Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'customerName'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('customerName')}
                          >
                            Customer Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'customerId'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('customerId')}
                          >
                            Customer ID
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'status'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('status')}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'source'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('source')}
                          >
                            Source
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'dateSource'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('dateSource')}
                          >
                            Date Added
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">Loading...</TableCell>
                        </TableRow>
                      ) : employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">No employees found</TableCell>
                        </TableRow>
                      ) : (
                        employees.map((employee) => (
                          <TableRow key={employee._id} hover className="table-row">
                            <TableCell>{employee.employeeLeadId}</TableCell>
                            <TableCell>{employee.employeeId}</TableCell>
                            <TableCell>{employee.employeeName}</TableCell>
                            <TableCell>{employee.customerName}</TableCell>
                            <TableCell>{employee.customerId}</TableCell>
                            <TableCell>
                              <Chip
                                label={employee.status}
                                className={`status-chip ${getStatusColor(employee.status)}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  backgroundColor: getSourceColor(employee.source),
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
                                {employee.source}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(employee.dateSource).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleEdit(employee)}
                                color="primary"
                                size="small"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(employee._id)}
                                color="error"
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Add/Edit Employee Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: 'dialog-paper' }}
        >
          <DialogTitle className="dialog-title">
            {editingId ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogContent className="dialog-content">
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Lead ID"
                    name="employeeLeadId"
                    value={formData.employeeLeadId}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    disabled={editingId !== null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer ID"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                      required
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="On Leave">On Leave</MenuItem>
                      <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Source</InputLabel>
                    <Select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
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
            </Box>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingId ? 'Update' : 'Add'} Employee
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
}

export default EmployeePage;