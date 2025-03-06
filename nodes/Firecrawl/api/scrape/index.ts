import { INodeProperties } from 'n8n-workflow';
import {
	buildApiProperties,
	createOperationNotice,
	createScrapeOptionsProperty,
	createUrlProperty,
} from '../common';

// Define the operation name and display name
export const name = 'scrape';
export const displayName = 'Scrape a url and get its content';
export const operationName = 'scrape';

/**
 * Create the properties for the scrape operation
 */
function createScrapeProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// URL input
		createUrlProperty(name, 'https://firecrawl.dev'),

		// Scrape options
		createScrapeOptionsProperty(operationName, false),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createScrapeProperties());

export { options, properties };
