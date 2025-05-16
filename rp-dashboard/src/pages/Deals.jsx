import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
import { useDeals } from '../hooks/useResourceProviders';
import { useTheme } from '@mui/material/styles';
import { getDealStateText, getDealStateColor, truncateAddress, formatDate, timeAgo } from '../utils/formatters';
import { debugLogger } from '../utils/debugLogger';

const Deals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { data: deals, isLoading, error } = useDeals();
  const theme = useTheme();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">Error loading deals data</Typography>
    );
  }

  // Filter deals based on search term
  const filteredDeals = searchTerm
    ? deals.filter(deal =>
        deal.deal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.resource_provider.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : deals;

  // Group deals by state
  const dealsByState = {};
  deals.forEach(deal => {
    const state = deal.state;
    if (!dealsByState[state]) {
      dealsByState[state] = [];
    }
    dealsByState[state].push(deal);
  });

  // Create data for the line chart (simulated time series)
  // In a real app, this would come from the API with actual timestamps
  const generateTimeSeriesData = () => {
    // Generate dates for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.getTime();
    });

    // Generate random counts for each state
    const statesCounts = {};
    Object.keys(dealsByState).forEach(state => {
      statesCounts[state] = Array.from({ length: 30 }, () => 
        Math.floor(Math.random() * 10) + (dealsByState[state].length / 3)
      );
    });

    return { dates, statesCounts };
  };

  const timeSeriesData = generateTimeSeriesData();

  // Columns for the deals data grid
  const columns = [
    {
      field: 'dealId',
      headerName: 'Deal ID',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" title={params.value}>
          {truncateAddress(params.value, 8, 4)}
        </Typography>
      ),
    },
    {
      field: 'resourceProvider',
      headerName: 'Provider',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={truncateAddress(params.value)}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={getDealStateText(params.value)}
          color={getDealStateColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 200,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'timeAgo',
      headerName: 'Time',
      width: 150,
      valueGetter: (params) => {
        return timeAgo(debugLogger.safeGet(params, 'row.createdAt', new Date()));
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton size="small">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Transform data for the data grid
  const rows = filteredDeals.map((deal) => ({
    id: deal.deal_id,
    dealId: deal.deal_id,
    resourceProvider: deal.resource_offer.resource_provider,
    state: deal.state,
    createdAt: deal.resource_offer.created_at,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Deal Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track and analyze deals in the Lilypad network
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                placeholder="Search by deal ID or provider address"
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
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} fullWidth>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterListIcon />}
                >
                  Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Deal Analytics */}
        <Grid item xs={12} >
          <Card>
            <Box sx={{ borderBottom: 1,  borderColor: 'divider' } }>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Deal Activity" />
                <Tab label="Deal States" />
              </Tabs>
            </Box>
            <CardContent>
              <Box sx={{ height: 300, }}>
                {tabValue === 0 && (
                  <LineChart
                    xAxis={[
                      {
                        data: timeSeriesData.dates,
                        scaleType: 'time',
                        valueFormatter: (date) => formatDate(date),
                      },
                    ]}
                    series={Object.entries(timeSeriesData.statesCounts).map(([state, data]) => ({
                      data,
                      label: getDealStateText(Number(state)),
                      color: theme.palette[getDealStateColor(Number(state))].main,
                    }))}
                    height={280}
                    margin={{ top: 20, bottom: 30, left: 40, right: 100 }}
                  />
                )}
                {tabValue === 1 && (
                  <Box sx={{ p: 2 }}>
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Deal State</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(dealsByState).map(([state, stateDeals]) => (
                            <TableRow key={state}>
                              <TableCell>
                                <Chip
                                  label={getDealStateText(Number(state))}
                                  color={getDealStateColor(Number(state))}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">{stateDeals.length}</TableCell>
                              <TableCell align="right">
                                {`${((stateDeals.length / deals.length) * 100).toFixed(1)}%`}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Deals Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deals
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 400 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Deals;
