import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useResourceProviders } from '../hooks/useResourceProviders';
import { getProviderStatus, getStatusColor, timeAgo, truncateAddress } from '../utils/formatters';

const RecentProviders = () => {
  const { data: providers, isLoading, error } = useResourceProviders();
  
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', minHeight: 300 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Providers</Typography>
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
          <Typography variant="h6" gutterBottom>Recent Providers</Typography>
          <Typography color="error">Error loading providers</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Sort providers by created_at timestamp (most recent first)
  const sortedProviders = [...providers].sort((a, b) => 
    b.resource_offer.created_at - a.resource_offer.created_at
  ).slice(0, 5); // Take only the 5 most recent
  
  return (
    <Card sx={{ height: '100%', minHeight: 300 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Recent Providers</Typography>
        <List sx={{ width: '100%' }}>
          {sortedProviders.map((provider, index) => {
            const providerAddress = provider.resource_offer.resource_provider;
            const createdAt = provider.resource_offer.created_at;
            const status = getProviderStatus(createdAt);
            const statusColor = getStatusColor(status);
            
            return (
              <Box key={providerAddress + index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {truncateAddress(providerAddress)}
                        <Chip 
                          label={status}
                          color={statusColor}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          sx={{ display: 'block' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {timeAgo(createdAt)}
                        </Typography>
                        {provider.resource_offer.spec.gpus && provider.resource_offer.spec.gpus.length > 0 && (
                          <Typography component="span" variant="body2">
                            {provider.resource_offer.spec.gpus[0].name}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < sortedProviders.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentProviders;
