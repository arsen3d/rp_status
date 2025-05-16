import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ResourceProviderService from '../services/ResourceProviderService';

// Define a common query key for all hooks that use the same data source
const RESOURCE_DATA_QUERY_KEY = ['resource-data'];

// Custom hook for fetching resource providers
export const useResourceProviders = () => {
  return useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getAll,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000 // 5 seconds
  });
};

// Custom hook for fetching a specific resource provider
export const useResourceProvider = (id) => {
  // First get the shared data
  const { data: allProviders, isLoading, error } = useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getAll,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // 5 seconds
    enabled: !!id
  });
  
  // Then filter locally to get the specific provider
  const provider = allProviders ? allProviders.find(p => p.id === id) : null;
  
  return {
    data: provider,
    isLoading,
    error
  };
};

// Custom hook for fetching deals
export const useDeals = () => {
  // Reuse the same query to avoid multiple data fetches
  return useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getDeals,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000 // 5 seconds
  });
};

// Custom hook for fetching a specific deal
export const useDeal = (id) => {
  // First get the shared data
  const { data: allDeals, isLoading, error } = useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getDeals,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // 5 seconds
    enabled: !!id
  });
  
  // Then filter locally to get the specific deal
  const deal = allDeals ? allDeals.find(d => d.deal_id === id) : null;
  
  return {
    data: deal,
    isLoading,
    error
  };
};

// Custom hook for fetching hardware specs
export const useHardwareSpecs = () => {
  // Reuse the same query but transform the data
  const { data: allProviders, isLoading, error } = useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getAll,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000 // 5 seconds
  });
  
  // Transform the data if available
  const hardwareSpecs = allProviders ? ResourceProviderService.transformToHardwareSpecs(allProviders) : null;
  
  return {
    data: hardwareSpecs,
    isLoading,
    error
  };
};

// Custom hook for fetching network stats
export const useNetworkStats = () => {
  // Reuse the same query but transform the data
  const { data: allProviders, isLoading, error } = useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getAll,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000 // 5 seconds
  });
  
  // Transform the data if available
  const networkStats = allProviders ? ResourceProviderService.calculateNetworkStats(allProviders) : null;
  
  return {
    data: networkStats,
    isLoading,
    error
  };
};

// Custom hook for providers with pagination, filtering, and sorting
export const useResourceProvidersTable = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [sortModel, setSortModel] = useState([]);

  // Reuse the same shared query
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: RESOURCE_DATA_QUERY_KEY,
    queryFn: ResourceProviderService.getAll,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000 // 5 seconds
  });
  
  // Transform the data to match the expected format for DataGrid
  const data = rawData ? rawData.map(provider => {
    return {
      id: provider.id,
      resourceProvider: provider.resource_provider,
      state: provider.state,
      createdAt: provider.resource_offer?.created_at || Date.now(),
      spec: provider.resource_offer?.spec || {},
    };
  }) : [];

  // Apply filters manually (in a real app, this would be done server-side)
  const filteredData = data ? data.filter(provider => {
    if (filterModel.items.length === 0) return true;
    
    return filterModel.items.every(filter => {
      const value = provider.resourceProvider || '';
      if (filter.operatorValue === 'contains') {
        return value.toLowerCase().includes(filter.value.toLowerCase());
      }
      return true;
    });
  }) : [];

  // Apply sorting manually (in a real app, this would be done server-side)
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortModel.length === 0) return 0;
    
    const sortItem = sortModel[0];
    const aValue = a.resourceProvider || '';
    const bValue = b.resourceProvider || '';
    
    return sortItem.sort === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Apply pagination manually (in a real app, this would be done server-side)
  const paginatedData = sortedData.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  return {
    data: paginatedData,
    totalCount: filteredData.length,
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
  };
};

export default { 
  useResourceProviders, 
  useResourceProvider, 
  useDeals, 
  useDeal, 
  useHardwareSpecs, 
  useNetworkStats,
  useResourceProvidersTable
};
