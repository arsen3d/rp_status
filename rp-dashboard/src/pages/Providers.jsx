// filepath: /root/rp_status/rp-dashboard/src/pages/Providers.jsx
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useResourceProvidersTable } from '../hooks/useResourceProviders';
import { formatBytes, timeAgo, getProviderStatus, getStatusColor, truncateAddress } from '../utils/formatters';
import { debugLogger } from '../utils/debugLogger';

const Providers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    data: providers, 
    totalCount,
    isLoading, 
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    filterModel,
    setFilterModel,
    sortModel,
    setSortModel,
  } = useResourceProvidersTable();

  // Columns for the data grid
  const columns = [
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => {
        // Safely get the resource provider value
        return debugLogger.safeGet(params, 'row.resourceProvider', 'Unknown');
      },
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" component="div">
              {truncateAddress(debugLogger.safeGet(params, 'value', 'Unknown'))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo(debugLogger.safeGet(params, 'row.createdAt', new Date()))}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => {
        // Safely get status or use a default
        const state = debugLogger.safeGet(params, 'row.state', 0);
        return getProviderStatus(state);
      },
      renderCell: (params) => (
        <Chip
          label={debugLogger.safeGet(params, 'value', 'Unknown')}
          color={getStatusColor(debugLogger.safeGet(params, 'value', 'Unknown'))}
          size="small"
        />
      ),
    },
    {
      field: 'gpu',
      headerName: 'GPU',
      width: 120,
      valueGetter: (params) => {
        // Use safeGet to handle undefined params or params.row
        return debugLogger.safeGet(params, 'row.spec.gpu', 0);
      },
    },
    {
      field: 'gpuModel',
      headerName: 'GPU Model',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => {
        // Add valueGetter to safely extract GPU model
        const gpus = debugLogger.safeGet(params, 'row.spec.gpus', []);
        if (gpus.length > 0) {
          return debugLogger.safeGet(gpus[0], 'name', 'Unknown GPU');
        }
        return 'No GPU';
      },
    },
    {
      field: 'cpu',
      headerName: 'CPU (MHz)',
      width: 120,
      valueGetter: (params) => {
        return debugLogger.safeGet(params, 'row.spec.cpu', 0);
      },
    },
    {
      field: 'ram',
      headerName: 'RAM',
      width: 120,
      valueGetter: (params) => {
        return formatBytes(debugLogger.safeGet(params, 'row.spec.ram', 0));
      },
    },
    {
      field: 'disk',
      headerName: 'Disk',
      width: 120,
      valueGetter: (params) => {
        return formatBytes(debugLogger.safeGet(params, 'row.spec.disk', 0));
      },
    },
  ];

  // Transform data for the data grid
  const rows = providers ? providers.map((provider, index) => {
    // Use safeGet for safe property access
    const resourceOffer = debugLogger.safeGet(provider, 'resource_offer', {});
    const spec = debugLogger.safeGet(resourceOffer, 'spec', {});
    const gpus = debugLogger.safeGet(spec, 'gpus', []);
    
    const gpuModel = gpus.length > 0 ? gpus[0].name : 'N/A';
    
    return {
      id: provider.id || index,
      provider: debugLogger.safeGet(resourceOffer, 'resource_provider', 'Unknown'),
      status: resourceOffer.created_at ? getProviderStatus(resourceOffer.created_at) : 'Unknown',
      createdAt: resourceOffer.created_at || new Date().toISOString(),
      spec: spec,
      gpuModel,
    };
  }) : [];

  // Filter rows based on search term
  const filteredRows = searchTerm ? rows.filter(row => 
    row.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.gpuModel.toLowerCase().includes(searchTerm.toLowerCase())
  ) : rows;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resource Providers
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Monitor and track resource providers in the Lilypad network
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by provider address or GPU model"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="All" color="primary" variant="outlined" onClick={() => setSearchTerm('')} />
                <Chip label="Active" color="success" variant="outlined" onClick={() => setSearchTerm('active')} />
                <Chip label="Idle" color="warning" variant="outlined" onClick={() => setSearchTerm('idle')} />
                <Chip label="Offline" color="error" variant="outlined" onClick={() => setSearchTerm('offline')} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ height: 600 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">Error loading providers</Typography>
            ) : (
              <DataGrid
                rows={filteredRows}
                columns={columns}
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(model) => {
                  setPage(model.page);
                  setPageSize(model.pageSize);
                }}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                getRowClassName={(params) => {
                  return params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
                }}
                sx={{
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-row.even': {
                    backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Providers;
