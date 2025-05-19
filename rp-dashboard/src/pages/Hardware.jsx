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
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { useHardwareSpecs } from '../hooks/useResourceProviders';
import {formatVBytes, formatBytes, truncateAddress } from '../utils/formatters';

import { debugLogger } from '../utils/debugLogger';

const Hardware = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { data: hardwareData, isLoading, error } = useHardwareSpecs();
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
      <Typography color="error">Error loading hardware data</Typography>
    );
  }

  // Extract GPU data
  const gpuModels = {};
  const gpuVendors = {};
  const gpuVram = {};

  hardwareData.forEach(hw => {
    const gpus = hw.spec.gpus || [];
    gpus.forEach(gpu => {
      // Count by model
      const model = gpu.name;
      gpuModels[model] = (gpuModels[model] || 0) + 1;

      // Count by vendor
      const vendor = gpu.vendor;
      gpuVendors[vendor] = (gpuVendors[vendor] || 0) + 1;

      // Group by VRAM size
      const vram = Math.round(gpu.vram / 1024); // Convert to GB and round
      const vramKey = `${vram} GB`;
      gpuVram[vramKey] = (gpuVram[vramKey] || 0) + 1;
    });
  });

  // Transform data for charts
  const gpuModelData = Object.entries(gpuModels)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const gpuVendorData = Object.entries(gpuVendors)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const gpuVramData = Object.entries(gpuVram)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      // Sort by VRAM size numerically
      const aSize = parseInt(a.name.split(' ')[0]);
      const bSize = parseInt(b.name.split(' ')[0]);
      return bSize - aSize;
    });

  // Create a detailed table of hardware specs
  const filteredHardware = searchTerm 
    ? hardwareData.filter(hw => {
        const gpus = hw.spec.gpus || [];
        return gpus.some(gpu => 
          gpu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gpu.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        ) || hw.resourceProvider.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : hardwareData;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hardware Specifications
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Analyze the hardware resources available in the Lilypad network
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by provider address, GPU model, or vendor"
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
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* GPU Distribution Charts */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="GPU Models" />
                <Tab label="GPU Vendors" />
                <Tab label="VRAM Size" />
              </Tabs>
            </Box>
            <CardContent>
              <Box sx={{ height: 400 }}>
                {tabValue === 0 && (
                  <BarChart
                    xAxis={[
                      { 
                        scaleType: 'band', 
                        data: gpuModelData.map(d => d.name),
                        tickLabelStyle: {
                          fontSize: 10,
                          textAnchor: 'end',
                          transform: 'rotate(-45)',
                          dominantBaseline: 'central',
                        },
                      },
                    ]}
                    series={[
                      {
                        data: gpuModelData.map(d => d.count),
                        color: theme.palette.primary.main,
                        label: 'Count',
                      },
                    ]}
                    height={350}
                    margin={{ top: 10, bottom: 70, left: 40, right: 10 }}
                  />
                )}
                {tabValue === 1 && (
                  <BarChart
                    xAxis={[
                      { 
                        scaleType: 'band', 
                        data: gpuVendorData.map(d => d.name),
                      },
                    ]}
                    series={[
                      {
                        data: gpuVendorData.map(d => d.count),
                        color: theme.palette.secondary.main,
                        label: 'Count',
                      },
                    ]}
                    height={350}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                )}
                {tabValue === 2 && (
                  <BarChart
                    xAxis={[
                      { 
                        scaleType: 'band', 
                        data: gpuVramData.map(d => d.name),
                      },
                    ]}
                    series={[
                      {
                        data: gpuVramData.map(d => d.count),
                        color: theme.palette.info.main,
                        label: 'Count',
                      },
                    ]}
                    height={350}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Hardware Specifications Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hardware Specifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Provider</TableCell>
                      <TableCell>GPU Model</TableCell>
                      <TableCell align="right">VRAM</TableCell>
                      <TableCell align="right">CPU (MHz)</TableCell>
                      <TableCell align="right">RAM</TableCell>
                      <TableCell align="right">Disk</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHardware.map((hw) => {
                      const gpus = hw.spec.gpus || [];
                      const gpuInfo = gpus.length > 0 ? gpus[0] : null;
                      
                      return (
                        <TableRow key={hw.id}>
                          <TableCell>
                            <Chip 
                              label={truncateAddress(debugLogger.safeGet(hw, 'resourceProvider', 'Unknown'))} 
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {gpuInfo ? gpuInfo.name : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {gpuInfo ? formatVBytes(gpuInfo.vram ) : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {hw.spec.cpu ? hw.spec.cpu.toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {hw.spec.ram ? formatBytes(hw.spec.ram) : 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            {hw.spec.disk ? formatBytes(hw.spec.disk) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Hardware;
