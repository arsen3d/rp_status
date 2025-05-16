import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNetworkStats, useResourceProviders, useDeals } from '../hooks/useResourceProviders';
import { formatBytes, formatNumber, formatDate } from '../utils/formatters';
import { useTheme } from '@mui/material/styles';

const Financial = () => {
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

  // Generate simulated financial data (in a real app, this would come from the API)
  const generateFinancialData = () => {
    // Generate dates for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.getTime();
    });

    // Generate revenue data
    const revenue = dates.map(() => Math.floor(Math.random() * 1000) + 500);
    
    // Generate data for different resource types
    const gpuRevenue = dates.map(() => Math.floor(Math.random() * 700) + 300);
    const cpuRevenue = dates.map(() => Math.floor(Math.random() * 200) + 100);
    const storageRevenue = dates.map(() => Math.floor(Math.random() * 100) + 50);

    // Generate provider revenue data
    const uniqueProviders = [...new Set(providers.map(p => p.resource_offer.resource_provider))];
    const topProviders = uniqueProviders.slice(0, 5).map(provider => ({
      provider,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }));

    // Price model distribution data
    const priceModels = [
      { name: 'Fixed Price', value: 65 },
      { name: 'Dynamic', value: 25 },
      { name: 'Auction', value: 10 },
    ];

    return { dates, revenue, gpuRevenue, cpuRevenue, storageRevenue, topProviders, priceModels };
  };

  const financialData = generateFinancialData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track revenue, expenses, and financial trends in the Lilypad network
      </Typography>

      <Grid container spacing={3}>
        {/* Revenue Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Over Time
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 300 }}>
                <LineChart
                  xAxis={[
                    {
                      data: financialData.dates,
                      scaleType: 'time',
                      valueFormatter: (date) => formatDate(date),
                    },
                  ]}
                  series={[
                    {
                      data: financialData.revenue,
                      label: 'Total Revenue (USD)',
                      color: theme.palette.primary.main,
                    },
                  ]}
                  height={280}
                  margin={{ top: 20, bottom: 30, left: 60, right: 20 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Resource Type
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: financialData.gpuRevenue.reduce((a, b) => a + b, 0), label: 'GPU' },
                        { id: 1, value: financialData.cpuRevenue.reduce((a, b) => a + b, 0), label: 'CPU' },
                        { id: 2, value: financialData.storageRevenue.reduce((a, b) => a + b, 0), label: 'Storage' },
                      ],
                      innerRadius: 30,
                      outerRadius: 100,
                      paddingAngle: 2,
                      cornerRadius: 5,
                    },
                  ]}
                  height={280}
                  margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  slotProps={{
                    legend: {
                      direction: 'column',
                      position: { vertical: 'middle', horizontal: 'right' },
                      padding: 0,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Earning Providers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Earning Providers
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ height: 300 }}>
                <BarChart
                  xAxis={[
                    { 
                      scaleType: 'band', 
                      data: financialData.topProviders.map(p => p.provider.substring(0, 6) + '...'),
                    },
                  ]}
                  series={[
                    {
                      data: financialData.topProviders.map(p => p.revenue),
                      label: 'Revenue (USD)',
                      color: theme.palette.success.light,
                    },
                  ]}
                  height={280}
                  margin={{ top: 20, bottom: 30, left: 60, right: 20 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Price Models */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing Models
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mt: 4 }}>
                <List>
                  {financialData.priceModels.map((model, index) => (
                    <ListItem key={model.name} disablePadding sx={{ mb: 3 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">{model.name}</Typography>
                            <Typography variant="body1" fontWeight="bold">{model.value}%</Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={model.value}
                              color={index === 0 ? "primary" : index === 1 ? "secondary" : "info"}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Financial Health Indicators
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Average Deal Value"
                      secondary={`$${formatNumber(Math.floor(Math.random() * 500) + 100)}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Deal Duration"
                      secondary={`${Math.floor(Math.random() * 24) + 1} hours`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Deal Success Rate"
                      secondary={`${Math.floor(Math.random() * 10) + 90}%`}
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Financial;
