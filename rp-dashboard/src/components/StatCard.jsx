import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card sx={{ height: '100%', width: '350px',   }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}.light`, 
            color: `${color}.main`,
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
