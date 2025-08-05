import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton,
  Paper, LinearProgress, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const API_BASE_URL = 'http://localhost:5000';

function EmployeeDetailsPage() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    empId: '',
    empName: '',
    targetSales: 0,
    currentSales: 0,
    empContactNo: '',
    empMail: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = searchTerm
        ? `${API_BASE_URL}/api/employee-details?search=${encodeURIComponent(searchTerm)}`
        : `${API_BASE_URL}/api/employee-details`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/employee-details/${editingId}`
        : `${API_BASE_URL}/api/employee-details`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      setSnackbar({
        open: true,
        message: editingId ? 'Employee updated!' : 'Employee added!',
        severity: 'success'
      });
      fetchEmployees();
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      empId: employee.empId,
      empName: employee.empName,
      targetSales: employee.targetSales,
      currentSales: employee.currentSales,
      empContactNo: employee.empContactNo,
      empMail: employee.empMail
    });
    setEditingId(employee._id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-details/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setSnackbar({
        open: true,
        message: 'Employee deleted!',
        severity: 'success'
      });
      fetchEmployees();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      empId: '',
      empName: '',
      targetSales: 0,
      currentSales: 0,
      empContactNo: '',
      empMail: ''
    });
  };

  const calculateProgress = (current, target) => {
    return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Employee Management
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Search Employees"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1 }} /> }}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Employee
          </Button>
        </Box>

        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Target Sales</TableCell>
                <TableCell>Current Sales</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id} hover>
                  <TableCell>{emp.empId}</TableCell>
                  <TableCell>{emp.empName}</TableCell>
                  <TableCell>${emp.targetSales.toLocaleString()}</TableCell>
                  <TableCell>${emp.currentSales.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(emp.currentSales, emp.targetSales)}
                          color={getProgressColor(calculateProgress(emp.currentSales, emp.targetSales))}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2">
                        {calculateProgress(emp.currentSales, emp.targetSales)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{emp.empContactNo}</TableCell>
                  <TableCell>{emp.empMail}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(emp)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(emp._id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Employee ID"
                value={formData.empId}
                onChange={(e) => setFormData({...formData, empId: e.target.value})}
                disabled={!!editingId}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                value={formData.empName}
                onChange={(e) => setFormData({...formData, empName: e.target.value})}
                required
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Target Sales ($)"
                  type="number"
                  value={formData.targetSales}
                  onChange={(e) => setFormData({...formData, targetSales: Number(e.target.value)})}
                />
                <TextField
                  fullWidth
                  label="Current Sales ($)"
                  type="number"
                  value={formData.currentSales}
                  onChange={(e) => setFormData({...formData, currentSales: Number(e.target.value)})}
                />
              </Box>
              <TextField
                fullWidth
                margin="normal"
                label="Contact Number"
                value={formData.empContactNo}
                onChange={(e) => setFormData({...formData, empContactNo: e.target.value})}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                value={formData.empMail}
                onChange={(e) => setFormData({...formData, empMail: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {editingId ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({...snackbar, open: false})}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}

export default EmployeeDetailsPage;