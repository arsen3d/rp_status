import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ResourceProviderService from '../services/ResourceProviderService';

// Custom hook for fetching resource providers
export const useResourceProviders = () => {
  return useQuery({
    queryKey: ['resource-providers'],
    queryFn: ResourceProviderService.getAll,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000 // 1 minute
  });
};

// Custom hook for fetching a specific resource provider
export const useResourceProvider = (id) => {
  return useQuery({
    queryKey: ['resource-provider', id],
    queryFn: () => ResourceProviderService.getById(id),
    enabled: !!id,
    staleTime: 60000 // 1 minute
  });
};

// Custom hook for fetching deals
export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: ResourceProviderService.getDeals,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000 // 1 minute
  });
};

// Custom hook for fetching a specific deal
export const useDeal = (id) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => ResourceProviderService.getDealById(id),
    enabled: !!id,
    staleTime: 60000 // 1 minute
  });
};

// Custom hook for fetching hardware specs
export const useHardwareSpecs = () => {
  return useQuery({
    queryKey: ['hardware'],
    queryFn: ResourceProviderService.getHardwareSpecs,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000 // 1 minute
  });
};

// Custom hook for fetching network stats
export const useNetworkStats = () => {
  return useQuery({
    queryKey: ['network-stats'],
    queryFn: ResourceProviderService.getNetworkStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000 // 1 minute
  });
};

// Custom hook for providers with pagination, filtering, and sorting
export const useResourceProvidersTable = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [sortModel, setSortModel] = useState([]);

  const { data, isLoading, error } = useResourceProviders();

  // Apply filters manually (in a real app, this would be done server-side)
  const filteredData = data ? data.filter(provider => {
    if (filterModel.items.length === 0) return true;
    
    return filterModel.items.every(filter => {
      const value = provider.resource_offer.resource_provider;
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
    const aValue = a.resource_offer.resource_provider;
    const bValue = b.resource_offer.resource_provider;
    
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
