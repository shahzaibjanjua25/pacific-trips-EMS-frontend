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
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Add, Search, Delete, Edit, Refresh } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './styles.css';

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    empName: '',
    phoneNo: '',
    targetAmount: 0,
    achievedAmount: 0
  });
  const [filters, setFilters] = useState({
    searchText: '',
    fromDate: null,
    toDate: null
  });
  const [sortConfig, setSortConfig] = useState({ field: 'empName', direction: 'asc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/employees?';
      const params = new URLSearchParams();

      if (filters.searchText) params.append('search', filters.searchText);
      if (filters.fromDate) {
        params.append('fromDate', format(filters.fromDate, 'yyyy-MM-dd'));
      }
      if (filters.toDate) {
        params.append('toDate', format(filters.toDate, 'yyyy-MM-dd'));
      }
      if (sortConfig.field) {
        params.append('sortBy', `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.field}`);
      }

      const response = await fetch(url + params.toString());
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch employees');
      }
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
      fromDate: null,
      toDate: null
    });
  };

  const handleEdit = (employee) => {
    setFormData({
      empName: employee.empName,
      phoneNo: employee.phoneNo,
      targetAmount: employee.targetAmount,
      achievedAmount: employee.achievedAmount
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

      const payload = {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        achievedAmount: Number(formData.achievedAmount)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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
      empName: '',
      phoneNo: '',
      targetAmount: 0,
      achievedAmount: 0
    });
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
                    startIcon={<Refresh />}
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
                            active={sortConfig.field === 'empId'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('empId')}
                          >
                            Employee ID
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'empName'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('empName')}
                          >
                            Employee Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          Phone No
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'targetAmount'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('targetAmount')}
                          >
                            Target Amount
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'achievedAmount'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('achievedAmount')}
                          >
                            Achieved Amount
                          </TableSortLabel>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <TableSortLabel
                            active={sortConfig.field === 'createdAt'}
                            direction={sortConfig.direction}
                            onClick={() => handleSort('createdAt')}
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
                          <TableCell colSpan={7} align="center">Loading...</TableCell>
                        </TableRow>
                      ) : employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No employees found</TableCell>
                        </TableRow>
                      ) : (
                        employees.map((employee) => (
                          <TableRow key={employee._id} hover className="table-row">
                            <TableCell>{employee.empId}</TableCell>
                            <TableCell>{employee.empName}</TableCell>
                            <TableCell>{employee.phoneNo}</TableCell>
                            <TableCell>${employee.targetAmount.toLocaleString()}</TableCell>
                            <TableCell>${employee.achievedAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              {new Date(employee.createdAt).toLocaleDateString('en-US', {
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
                {editingId && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={formData.empId || ''}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    name="empName"
                    value={formData.empName}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Amount ($)"
                    name="targetAmount"
                    type="number"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Achieved Amount ($)"
                    name="achievedAmount"
                    type="number"
                    value={formData.achievedAmount}
                    onChange={handleInputChange}
                    required
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
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