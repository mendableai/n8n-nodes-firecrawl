import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties } from '../common';
import { createOperationNotice } from '../common';

// Define the operation name and display name
export const name = 'search';
export const displayName = 'Search and optionally scrape search results';
export const operationName = 'search';

/**
 * Create the query property
 */
function createQueryProperty(operation: string): INodeProperties {
	return {
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		description: 'The search query',
		routing: {
			request: {
				body: {
					query: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
			},
		},
	};
}

/**
 * Create the limit property
 */
function createLimitProperty(operation: string): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			request: {
				body: {
					limit: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
			},
		},
	};
}

/**
 * Create the time based search property
 */
function createTimeBasedSearchProperty(operation: string): INodeProperties {
	return {
		displayName: 'Time Based Search',
		name: 'tbs',
		type: 'string',
		default: '',
		description: 'Time-based search parameter',
		routing: {
			request: {
				body: {
					tbs: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
			},
		},
	};
}

/**
 * Create the language property
 */
function createLanguageProperty(operation: string): INodeProperties {
	return {
		displayName: 'Language',
		name: 'lang',
		type: 'string',
		default: 'en',
		description: 'Language code for search results',
		routing: {
			request: {
				body: {
					lang: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
			},
		},
	};
}

/**
 * Create the country property
 */
function createCountryProperty(operation: string): INodeProperties {
	return {
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: 'us',
		description: 'Country code for search results',
		routing: {
			request: {
				body: {
					country: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
			},
		},
	};
}

/**
 * Create the properties for the search operation
 */
function createSearchProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// Required parameters
		createQueryProperty(name),

		// Optional parameters
		createLimitProperty(name),
		createTimeBasedSearchProperty(name),
		createLanguageProperty(name),
		createCountryProperty(name),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createSearchProperties());

export { options, properties };
