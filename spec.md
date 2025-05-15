# Resource Provider Status Documentation

## Overview

This document describes the structure and content of the `sample.json` file, which contains information about resource providers, their offers, and deals in the Lilypad network. Lilypad appears to be a decentralized computing platform that facilitates matching computational resource providers with users.

## Data Structure

The JSON file contains an array of resource provider objects, each with the following structure:

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the resource provider entry (IPFS CID format) |
| `deal_id` | String | Identifier for the specific deal (IPFS CID format) |
| `resource_provider` | String | Ethereum address of the resource provider |
| `state` | Number | State of the deal (3 appears to indicate an active state) |
| `resource_offer` | Object | Detailed information about the resource offer |

### Resource Offer Structure

The `resource_offer` object contains detailed information about what the provider is offering:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier for the offer (matches the top-level ID) |
| `created_at` | Number | Unix timestamp (in milliseconds) when the offer was created |
| `resource_provider` | String | Ethereum address of the resource provider (matches the top-level address) |
| `index` | Number | Sequential index for the provider's offers (seems to be 0 for all in the sample) |
| `spec` | Object | Hardware specifications of the offered resources |
| `modules` | Array | Supported modules (empty in all examples) |
| `mode` | String | Pricing model (all are "FixedPrice" in the sample) |
| `default_pricing` | Object | Pricing details for the offered resources |
| `default_timeouts` | Object | Timeout settings for different stages of the deal |
| `module_pricing` | Object | Module-specific pricing (empty in all examples) |
| `module_timeouts` | Object | Module-specific timeouts (empty in all examples) |
| `trusted_parties` | Object | Trusted third parties for deal mediation and execution |

### Hardware Specifications

The `spec` object details the hardware resources available:

| Field | Type | Description |
|-------|------|-------------|
| `gpu` | Number | Number of GPUs available (1 in all examples) |
| `gpus` | Array | Detailed information about each GPU |
| `cpu` | Number | CPU capacity (in millicores, where 1000 = 1 core) |
| `ram` | Number | Available RAM in bytes |
| `disk` | Number | Available disk space in bytes |

### GPU Details

Each entry in the `gpus` array contains:

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Model name of the GPU |
| `vendor` | String | GPU manufacturer |
| `vram` | Number | Video RAM in MB |

### Pricing Details

The `default_pricing` object contains:

| Field | Type | Description |
|-------|------|-------------|
| `instruction_price` | Number | Base price for computing instructions |
| `payment_collateral` | Number | Required collateral for payment |
| `results_collateral_multiple` | Number | Collateral multiplier for results |
| `mediation_fee` | Number | Fee for mediation services |

### Timeout Settings

The `default_timeouts` object contains settings for different deal phases:

| Phase | Settings |
|-------|----------|
| `agree` | Timeout period and collateral for agreement phase |
| `submit_results` | Timeout period and collateral for result submission |
| `judge_results` | Timeout period and collateral for judging results |
| `mediate_results` | Timeout period and collateral for mediation |

### Trusted Parties

The `trusted_parties` object contains:

| Field | Type | Description |
|-------|------|-------------|
| `solver` | String | Ethereum address of the solving entity |
| `mediator` | Array | List of Ethereum addresses that can act as mediators |
| `api_host` | String | URL of the API host for this network |

## Example Resource Providers

The current data includes the following resource providers:

1. Provider: `0xC44CB6599bEc03196fD230208aBf4AFc68514DD2`
   - Hardware: NVIDIA GeForce RTX 4090 with 24GB VRAM
   - CPU: 22 cores
   - RAM: ~44GB
   - Disk: ~1.8TB

2. Provider: `0x5b1261b9e46Fd0066e762326DA9EcFAE0e4c61e4`
   - Hardware: NVIDIA GeForce RTX 4060 Ti with 16GB VRAM
   - CPU: 8 cores
   - RAM: ~21GB
   - Disk: ~493GB

## Network Information

All providers in this sample are connected to the Lilypad testnet, as indicated by the API host URL: `https://api-testnet.lilypad.tech/`

## Current State

All deals in the sample are in state `3`, which appears to indicate they are active or available.

## Last Updated

This documentation was generated on May 15, 2025.
