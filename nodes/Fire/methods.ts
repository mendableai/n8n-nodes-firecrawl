import { INodeType } from 'n8n-workflow';
import { apiMethods } from './api';

/**
 * All methods for the Fire API node
 *
 * This file centralizes all methods used by the Fire API node.
 * Methods are organized by their respective API operations and
 * include functionality for handling HTTP requests and responses.
 *
 * Currently includes:
 * - API methods for map operations
 * - API methods for scrape operations
 * - API methods for crawl operations
 * - API methods for getCrawlStatus operations
 * - API methods for extract operations
 * - API methods for getExtractStatus operations
 *
 * @returns The combined methods object that implements INodeType['methods']
 */
export const allMethods = {
  Default: {
    ...apiMethods.Default
  }
} as INodeType['methods'];
