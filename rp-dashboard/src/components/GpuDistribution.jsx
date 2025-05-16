import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useResourceProviders } from '../hooks/useResourceProviders';

const GpuDistribution = () => {
  const { data: providers, isLoading, error } = useResourceProviders();
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>GPU Distribution</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>GPU Distribution</Typography>
          <Typography color="error">Error loading GPU data</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Count GPUs by model
  const gpuCounts = {};
  
  providers.forEach(provider => {
    const gpus = provider.resource_offer.spec.gpus || [];
    gpus.forEach(gpu => {
      const gpuName = gpu.name;
      gpuCounts[gpuName] = (gpuCounts[gpuName] || 0) + 1;
    });
  });
  
  // Convert to array and sort by count (descending)
  const gpuData = Object.entries(gpuCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Limit to top 5
  
  // Extract data for charts
  const xLabels = gpuData.map(item => item.name);
  const seriesData = gpuData.map(item => item.count);
  
  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>GPU Distribution</Typography>
        
        {gpuData.length > 0 ? (
          <Box sx={{ height: 220, mb: 2 }}>
            <BarChart
              xAxis={[
                { 
                  scaleType: 'band', 
                  data: xLabels,
                  label: 'GPU Models',
                  tickLabelStyle: {
                    fontSize: 0,
                    textAnchor: 'end',
                    transform: 'rotate(-45)',
                    dominantBaseline: 'central',
                  },
                  tickLabelStyle: {
                    fontSize: 0,
                    
                    textAnchor: 'end',
                    transform: 'rotate(-45)',
                    dominantBaseline: 'central',
                  },
                  tickSize: 0,
                },
              ]}
              series={[
                {
                  data: seriesData,
                  color: theme.palette.primary.main,
                  label: 'Count',
                },
              ]}
              height={255}
              margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
              slotProps={{
                legend: { hidden: true },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography>No GPU data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GpuDistribution;
