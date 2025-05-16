import { useState, useEffect } from 'react';
import axios from 'axios';
import { debugLogger } from '../utils/debugLogger';

// Mock API URL - to be replaced with actual API endpoint
const API_URL = '/api';

// Cache for sample data to avoid multiple downloads
let sampleDataCache = null;

// Function to get sample data - fetches only once and caches the result
const getSampleData = async () => {
  if (sampleDataCache) {
    return sampleDataCache;
  }
  
  try {
    // const response = await axios.get('/sample.json');
    const response = await axios.get('https://solver-testnet.lilypad.tech/api/v1/resource_offers?active=true');
    
    sampleDataCache = Array.isArray(response.data) ? response.data : [response.data];
    return sampleDataCache;
  } catch (error) {
    console.error('Error fetching sample data:', error);
    throw error;
  }
};

// Service to handle API calls for resource provider data
const ResourceProviderService = {
  // Get all resource providers
  getAll: async () => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/providers`);
      // return response.data;
      
      // For now, we'll return mock data from the sample.json file
      const providers = await getSampleData();
      return providers;
    } catch (error) {
      console.error('Error fetching resource providers:', error);
      throw error;
    }
  },

  // Get a specific resource provider by ID
  getById: async (id) => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/providers/${id}`);
      // return response.data;
      
      // For now, we'll filter the mock data
      const providers = await getSampleData();
      return providers.find(provider => provider.id === id);
    } catch (error) {
      console.error(`Error fetching resource provider ${id}:`, error);
      throw error;
    }
  },

  // Get deals associated with a resource provider
  getProviderDeals: async (providerId) => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/providers/${providerId}/deals`);
      // return response.data;
      
      // For now, we'll filter the mock data
      const providers = await getSampleData();
      return providers.filter(provider => 
        provider.resource_offer.resource_provider === providerId
      );
    } catch (error) {
      console.error(`Error fetching deals for provider ${providerId}:`, error);
      throw error;
    }
  },

  // Get hardware specs for all providers
  getHardwareSpecs: async () => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/hardware`);
      // return response.data;
      
      // For now, we'll extract hardware info from the mock data
      const providers = await getSampleData();
      
      // Log the first provider data to help with debugging
      if (providers.length > 0) {
        debugLogger.warn('Sample provider data structure', { 
          provider: providers[0]
        });
      }
      
      return providers.map(provider => {
        // Use safeGet to safely access nested properties with fallback values
        const resourceProvider = debugLogger.safeGet(provider, 'resource_offer.resource_provider', 
          // Fallback to the top-level resource_provider if the nested one doesn't exist
          debugLogger.safeGet(provider, 'resource_provider', 'unknown'));
        
        return {
          id: debugLogger.safeGet(provider, 'id', 'unknown-id'),
          resourceProvider: resourceProvider,
          spec: debugLogger.safeGet(provider, 'resource_offer.spec', {})
        };
      });
    } catch (error) {
      console.error('Error fetching hardware specs:', error);
      throw error;
    }
  },

  // Get all deals
  getDeals: async () => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/deals`);
      // return response.data;
      
      // For now, we'll return the mock data
      const deals = await getSampleData();
      return deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  },

  // Get a specific deal by ID
  getDealById: async (id) => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/deals/${id}`);
      // return response.data;
      
      // For now, we'll filter the mock data
      const deals = await getSampleData();
      return deals.find(deal => deal.deal_id === id);
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error);
      throw error;
    }
  },

  // Get network stats
  getNetworkStats: async () => {
    try {
      // In a real implementation, this would be a call to the Lilypad API
      // const response = await axios.get(`${API_URL}/stats`);
      // return response.data;
      
      // For now, we'll calculate from the mock data
      const providers = await getSampleData();
      
      // Count unique resource providers
      const uniqueProviders = new Set();
      providers.forEach(provider => {
        uniqueProviders.add(provider.resource_offer.resource_provider);
      });
      
      // Count GPU models
      const gpuModels = {};
      providers.forEach(provider => {
        const gpus = provider.resource_offer.spec.gpus || [];
        gpus.forEach(gpu => {
          const model = gpu.name;
          gpuModels[model] = (gpuModels[model] || 0) + 1;
        });
      });
      
      // Calculate totals
      const totalCPU = providers.reduce((sum, provider) => 
        sum + (provider.resource_offer.spec.cpu || 0), 0);
      
      const totalRAM = providers.reduce((sum, provider) => 
        sum + (provider.resource_offer.spec.ram || 0), 0);
      
      const totalDisk = providers.reduce((sum, provider) => 
        sum + (provider.resource_offer.spec.disk || 0), 0);
      
      return {
        providerCount: uniqueProviders.size,
        totalDeals: providers.length,
        gpuModels,
        totalCPU,
        totalRAM,
        totalDisk
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      throw error;
    }
  }
};

export default ResourceProviderService;
