# Lilypad Resource Provider Dashboard
## Product Requirements Document

**Version:** 1.0  
**Date:** May 15, 2025  
**Author:** GitHub Copilot

## 1. Introduction

### 1.1 Purpose
The Lilypad Resource Provider Dashboard is a comprehensive monitoring and management tool designed to provide real-time insights into the Lilypad decentralized computing network. It allows users to monitor resource provider status, hardware specifications, deals, and network activity.

### 1.2 Scope
This dashboard will serve as a central hub for network participants to track resource availability, provider statistics, financial data, and network health across the Lilypad ecosystem.

### 1.3 Target Audience
- Network administrators and operators
- Resource providers
- Deal makers and computational resource consumers
- Lilypad platform developers
- Network analysts and researchers

## 2. Product Overview

### 2.1 Product Vision
A comprehensive, real-time dashboard that provides actionable insights into the Lilypad network, helping stakeholders make informed decisions about resource allocation, pricing strategies, and network participation.

### 2.2 Key Features
1. Resource provider monitoring
2. Hardware utilization tracking
3. Deal status visualization
4. Network health metrics
5. Provider performance analytics
6. Financial metrics and projections
7. Geographic distribution visualization
8. Historical trend analysis

## 3. User Stories and Requirements

### 3.1 Dashboard Overview
**As a** network operator  
**I want to** view a high-level overview of the entire network  
**So that** I can quickly assess network health and activity.

Requirements:
- Total number of active resource providers
- Distribution of GPU models across the network
- Total computational capacity (CPU, RAM, GPU)
- Network activity heatmap by time
- Total active deals
- Distribution of deal states

### 3.2 Resource Provider Monitoring
**As a** platform administrator  
**I want to** monitor individual resource providers  
**So that** I can track their availability and performance.

Requirements:
- List view of all resource providers with filtering options
- Provider status indicators (active, idle, offline)
- Provider address with optional metadata (name, location)
- Last seen timestamp
- Provider uptime statistics
- Provider tier classification based on hardware specs

### 3.3 Hardware Specifications
**As a** deal maker  
**I want to** browse available hardware resources  
**So that** I can find suitable providers for my computational needs.

Requirements:
- Detailed view of GPU specifications with filtering options
- CPU capacity visualization
- RAM availability metrics
- Disk space availability
- Comparative view of providers based on hardware specs
- Hardware performance benchmarks (if available)

### 3.4 Deal Management
**As a** resource consumer  
**I want to** track my active and historical deals  
**So that** I can manage my resource usage and expenses.

Requirements:
- Deal status tracking with state transitions
- Deal duration metrics
- Financial details of each deal
- Performance metrics of deals
- Deal history with filtering options
- Deal creation and modification timestamps

### 3.5 Financial Analytics
**As a** resource provider  
**I want to** view financial metrics related to my offered resources  
**So that** I can optimize my pricing strategy.

Requirements:
- Revenue tracking by provider
- Pricing comparison across similar resource offerings
- Collateral management view
- Payment history
- Financial projections based on current usage
- Cost-efficiency metrics

### 3.6 Network Analytics
**As a** network analyst  
**I want to** visualize network-wide trends  
**So that** I can identify patterns and make predictions.

Requirements:
- Time-series data of network activity
- Provider join/leave events
- Deal creation rate over time
- Resource utilization trends
- Pricing trends over time
- Geographical distribution of providers and consumers

## 4. Functional Requirements

### 4.1 Data Collection and Processing
- Real-time data ingestion from the Lilypad API
- Historical data storage and aggregation
- Data normalization for consistent analysis
- Automated data validation and error handling
- Regular polling mechanism for updated provider status

### 4.2 Visualization Components
- Provider status cards with key metrics
- Hardware specification comparison tables
- Deal status timeline visualization
- Geographic map of provider distribution
- Time-series charts for historical analysis
- Network health indicators
- Resource utilization gauges
- Financial metrics displays

### 4.3 User Interface
- Responsive design for desktop and mobile access
- Customizable dashboard layouts
- User preference saving
- Dark/light mode toggle
- Exportable reports and data
- Interactive filters and search functionality
- Notification system for important events

### 4.4 Authentication and Authorization
- Role-based access control
- Provider-specific views with authentication
- Admin dashboard for platform managers
- Public/private data separation
- API token management for programmatic access

## 5. Technical Requirements

### 5.1 Frontend
- Modern JavaScript framework (React/Vue/Angular)
- Real-time data updates using WebSockets
- Responsive UI framework for cross-device compatibility
- Data visualization libraries for complex charts
- Geospatial visualization capabilities
- Accessibility compliance (WCAG 2.1)

### 5.2 Backend
- API integration with Lilypad services
- Data aggregation and analytics engine
- Caching mechanism for performance optimization
- Scheduled data polling and updates
- Historical data storage and retrieval
- Authentication service integration

### 5.3 Data Structure
The dashboard will leverage the existing data structure from the Lilypad API, which includes:

#### Resource Provider Data
- Provider ID and Ethereum address
- Hardware specifications (GPU, CPU, RAM, disk)
- Detailed GPU information (model, VRAM, vendor)
- Pricing models and rates
- Timeout settings
- Trusted parties information

#### Deal Data
- Deal ID
- Associated resource provider
- Deal state
- Creation timestamp
- Financial details

### 5.4 Performance Requirements
- Dashboard loading time under 2 seconds
- Real-time data updates within 5 seconds of change
- Support for at least 100 concurrent users
- Ability to handle data for 1000+ resource providers
- Historical data storage for at least 1 year
- Responsive design for all screen sizes

## 6. Dashboard Sections and Layouts

### 6.1 Main Dashboard
- Network overview metrics
- Active providers count and status
- Resource utilization summary
- Recent deals activity
- Network health indicators
- Quick filters for common views

### 6.2 Provider Explorer
- Searchable and filterable provider list
- Detailed provider cards with expandable views
- Hardware specification details
- Provider historical performance
- Provider-specific deals
- Geographic location (if available)

### 6.3 Hardware Analytics
- GPU distribution by model
- CPU capacity distribution
- RAM and disk space availability
- Performance benchmarks comparison
- Hardware utilization trends
- Price-to-performance ratios

### 6.4 Deal Analytics
- Active deals monitoring
- Deal state distribution
- Deal duration metrics
- Deal value analysis
- Consumer activity patterns
- Deal success rate analytics

### 6.5 Financial Dashboard
- Revenue tracking
- Pricing optimization recommendations
- Collateral management
- Payment processing status
- Financial projections
- Market rate comparison

### 6.6 Network Health
- Node connectivity status
- API response time monitoring
- Deal success rate
- Provider reliability metrics
- Network growth indicators
- System alerts and notifications

## 7. Implementation Phases

### 7.1 Phase 1: Core Dashboard (Weeks 1-4)
- Basic dashboard infrastructure
- Provider listing and details view
- Hardware specifications display
- Simple deal status tracking
- Basic filtering and search

### 7.2 Phase 2: Advanced Analytics (Weeks 5-8)
- Historical data visualization
- Provider performance metrics
- Deal analytics
- Financial tracking
- Time-series analysis

### 7.3 Phase 3: Enhanced Features (Weeks 9-12)
- Geographic distribution map
- Customizable dashboard layouts
- Advanced filtering options
- Exportable reports
- User preferences

### 7.4 Phase 4: Optimization and Scale (Weeks 13-16)
- Performance optimizations
- Mobile responsiveness improvements
- API enhancements
- Advanced search capabilities
- Large-scale data handling

## 8. Success Metrics

### 8.1 Technical Metrics
- Dashboard load time < 2 seconds
- Real-time update latency < 5 seconds
- System uptime > 99.9%
- API response time < 200ms
- Zero data discrepancies between dashboard and source data

### 8.2 User Experience Metrics
- User session duration > 5 minutes
- Feature utilization tracking
- User satisfaction surveys (target: 4.5/5)
- Feature request tracking
- Decreased support tickets related to network status inquiries

### 8.3 Business Metrics
- Increased resource provider participation
- Higher deal completion rate
- Reduced time to identify and resolve network issues
- Improved resource allocation efficiency
- Enhanced pricing optimization

## 9. Integration Requirements

### 9.1 API Integration
- Lilypad API for resource provider data
- Ethereum blockchain for transaction verification
- Geolocation services for provider mapping
- Authentication services
- Notification services

### 9.2 External Systems
- Email notification system
- Export to CSV/PDF for reporting
- Integration with common analytics platforms
- Webhook support for custom integrations
- Mobile app push notifications (future phase)

## 10. Appendix

### 10.1 Data Schema Reference
The dashboard will utilize the data schema as defined in the `sample.json` file, which includes:

- Resource provider identifiers
- Deal IDs and states
- Hardware specifications
- Pricing models
- Timeout settings
- Trusted parties

### 10.2 Mockups and Wireframes
(To be developed during the design phase)

### 10.3 Glossary
- **Resource Provider**: An entity offering computational resources in the Lilypad network
- **Deal**: An agreement between a resource provider and a consumer
- **GPU/CPU/RAM/Disk**: Hardware resources provided by resource providers
- **Collateral**: Funds locked as guarantee during deal execution
- **Mediator**: Trusted third party that resolves disputes
- **Solver**: Entity responsible for matching resource providers with consumers

---

*This PRD is a living document and will be updated as requirements evolve and additional information becomes available.*
