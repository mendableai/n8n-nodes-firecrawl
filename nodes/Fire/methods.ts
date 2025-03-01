import { INodeType } from 'n8n-workflow';
import { methods as apiMethods } from './api';

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
 *
 * @returns The combined methods object that implements INodeType['methods']
 */
export const allMethods: INodeType['methods'] = {
  ...apiMethods,
  // Add any additional methods here if needed in the future
};
