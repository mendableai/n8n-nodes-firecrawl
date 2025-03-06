import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties, createOperationNotice, createUrlProperty } from '../common';

// Define the operation name and display name
export const name = 'map';
export const displayName = 'Map a website and get urls';
export const operationName = 'map';

function createIgnoreSitemapProperty(): INodeProperties {
	return {
		displayName: 'Ignore Sitemap',
		name: 'ignoreSitemap',
		type: 'boolean',
		default: true,
		description: 'Whether to ignore the website sitemap when crawling',
		routing: {
			request: {
				body: {
					ignoreSitemap: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

function createSitemapOnlyProperty(): INodeProperties {
	return {
		displayName: 'Sitemap Only',
		name: 'sitemapOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to only return links found in the website sitemap',
		routing: {
			request: {
				body: {
					sitemapOnly: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

function createIncludeSubdomainsProperty(): INodeProperties {
	return {
		displayName: 'Include Subdomains',
		name: 'includeSubdomains',
		type: 'boolean',
		default: false,
		description: 'Whether to include subdomains of the website',
		routing: {
			request: {
				body: {
					includeSubdomains: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

function createLimitProperty(): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
			maxValue: 5000,
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: 5000,
		description: 'Max number of results to return',
		routing: {
			request: {
				body: {
					limit: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

function createTimeoutProperty(): INodeProperties {
	return {
		displayName: 'Timeout (Ms)',
		name: 'timeout',
		type: 'number',
		default: 10000,
		description: 'Timeout in milliseconds for the request',
		routing: {
			request: {
				body: {
					timeout: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

/**
 * Create the properties for the map operation
 */
function createMapProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		createUrlProperty(name),

		createIgnoreSitemapProperty(),

		createSitemapOnlyProperty(),

		createIncludeSubdomainsProperty(),

		createLimitProperty(),

		createTimeoutProperty(),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createMapProperties());

export { options, properties };
