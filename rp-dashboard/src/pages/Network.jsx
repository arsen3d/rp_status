import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Stack,
  LinearProgress,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import WarningIcon from '@mui/icons-material/Warning';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTheme } from '@mui/material/styles';
import { useNetworkStats, useResourceProviders, useDeals } from '../hooks/useResourceProviders';
import { formatDate } from '../utils/formatters';

const NetworkHealth = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: providers, isLoading: providersLoading } = useResourceProviders();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const theme = useTheme();

  const isLoading = statsLoading || providersLoading || dealsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Generate simulated network health data (in a real app, this would come from the API)
  const generateNetworkHealthData = () => {
    // Generate dates for the last 24 hours in 15-minute intervals
    const intervals = 24 * 4; // 24 hours * 4 (15 min intervals)
    const dates = Array.from({ length: intervals }, (_, i) => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - ((intervals - 1 - i) * 15));
      return date.getTime();
    });

    // Generate network metrics
    const apiResponseTime = dates.map(() => Math.floor(Math.random() * 100) + 50); // 50-150ms
    const nodeLatency = dates.map(() => Math.floor(Math.random() * 80) + 20); // 20-100ms
    const dealSuccessRate = dates.map(() => Math.floor(Math.random() * 10) + 90); // 90-100%
    const activeNodes = dates.map(() => Math.floor(Math.random() * 20) + stats.providerCount - 10); // ~providerCount

    // Generate system health indicators
    const systemHealth = {
      apiStatus: { status: 'operational', uptime: 99.98 },
      blockchain: { status: 'operational', uptime: 100 },
      providerNetwork: { status: 'operational', uptime: 99.5 },
      dataStorage: { status: 'degraded', uptime: 97.2 },
      ipfsGateway: { status: 'operational', uptime: 99.8 },
    };

    // Generate recent incidents (if any)
    const recentIncidents = [
      {
        id: 'INC-001',
        title: 'Data Storage Performance Degradation',
        status: 'investigating',
        time: new Date(Date.now() - 1000 * 60 * 30).getTime(), // 30 minutes ago
        description: 'We are investigating reports of slower than normal data storage operations.',
      },
    ];

    return { 
      dates, 
      apiResponseTime, 
      nodeLatency, 
      dealSuccessRate, 
      activeNodes,
      systemHealth,
      recentIncidents
    };
  };

  const networkHealthData = generateNetworkHealthData();

  // Helper to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'major_outage':
        return 'error';
      default:
        return 'info';
    }
  };

  // Calculate a simulated health score (0-100)
  const calculateHealthScore = () => {
    const uptimeValues = Object.values(networkHealthData.systemHealth).map(s => s.uptime);
    const avgUptime = uptimeValues.reduce((sum, val) => sum + val, 0) / uptimeValues.length;
    return Math.round(avgUptime);
  };

  const healthScore = calculateHealthScore();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Network Health
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Monitor the health and performance of the Lilypad network
      </Typography>

      {/* Overall Health Score */}
      <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${healthScore}%`,
            bgcolor: healthScore > 95 ? 'success.light' : healthScore > 80 ? 'warning.light' : 'error.light',
            opacity: 0.2,
          }}
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Network Health Score</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
                  {healthScore}%
                </Typography>
                <Chip 
                  label={healthScore > 95 ? "Excellent" : healthScore > 80 ? "Good" : "Needs Attention"} 
                  color={healthScore > 95 ? "success" : healthScore > 80 ? "warning" : "error"}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ width: '100%' }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">API Response Time</Typography>
                      <Typography variant="body2" fontWeight="bold">{networkHealthData.apiResponseTime.slice(-1)[0]}ms</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={70} color="info" sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Node Latency</Typography>
                      <Typography variant="body2" fontWeight="bold">{networkHealthData.nodeLatency.slice(-1)[0]}ms</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="success" sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Deal Success Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">{networkHealthData.dealSuccessRate.slice(-1)[0]}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={networkHealthData.dealSuccessRate.slice(-1)[0]} color="success" sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Network Metrics Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Network Metrics (Last 24 Hours)</Typography>
                <FormControlLabel
                  control={<Switch checked={showDetails} onChange={() => setShowDetails(!showDetails)} />}
                  label="Show Details"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 350 }}>
                <LineChart
                  xAxis={[
                    {
                      data: networkHealthData.dates,
                      scaleType: 'time',
                      valueFormatter: (date) => {
                        const d = new Date(date);
                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                      },
                    },
                  ]}
                  series={[
                    ...(showDetails ? [
                      {
                        data: networkHealthData.apiResponseTime,
                        label: 'API Response Time (ms)',
                        color: theme.palette.info.main,
                      },
                      {
                        data: networkHealthData.nodeLatency,
                        label: 'Node Latency (ms)',
                        color: theme.palette.warning.main,
                      }
                    ] : []),
                    {
                      data: networkHealthData.dealSuccessRate,
                      label: 'Deal Success Rate (%)',
                      color: theme.palette.success.main,
                    },
                    {
                      data: networkHealthData.activeNodes,
                      label: 'Active Nodes',
                      color: theme.palette.primary.main,
                    },
                  ]}
                  height={320}
                  margin={{ top: 20, bottom: 30, left: 60, right: 120 }}
                  slotProps={{
                    legend: { 
                      position: { vertical: 'middle', horizontal: 'right' },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Components */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>System Status</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {Object.entries(networkHealthData.systemHealth).map(([key, value]) => (
                  <ListItem key={key} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      {value.status === 'operational' ? (
                        <CheckCircleIcon color="success" />
                      ) : value.status === 'degraded' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })}
                      secondary={`${value.uptime}% uptime`}
                    />
                    <Chip
                      label={value.status.replace('_', ' ')}
                      color={getStatusColor(value.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Incidents & Stats */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Incidents</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {networkHealthData.recentIncidents.length > 0 ? (
                    networkHealthData.recentIncidents.map(incident => (
                      <Alert 
                        key={incident.id}
                        severity="warning"
                        icon={<WarningIcon />}
                        sx={{ mb: 2 }}
                      >
                        <AlertTitle>{incident.title}</AlertTitle>
                        {incident.description}
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {formatDate(incident.time)} • {incident.status}
                        </Typography>
                      </Alert>
                    ))
                  ) : (
                    <Alert severity="success" icon={<CloudDoneIcon />}>
                      <AlertTitle>All Systems Operational</AlertTitle>
                      No incidents reported in the last 24 hours.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Typography variant="subtitle1" gutterBottom>Network Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SignalCellularAltIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Network Growth: <b>+12.5%</b> (30d)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Avg. Response: <b>{Math.round(networkHealthData.apiResponseTime.reduce((a, b) => a + b, 0) / networkHealthData.apiResponseTime.length)}ms</b>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Deal Success: <b>{Math.round(networkHealthData.dealSuccessRate.reduce((a, b) => a + b, 0) / networkHealthData.dealSuccessRate.length)}%</b>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Failed Deals: <b>{Math.round(deals.length * 0.05)}</b> (5%)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkHealth;
