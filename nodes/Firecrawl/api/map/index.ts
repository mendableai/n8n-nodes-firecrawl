import {
	INodeProperties,
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { buildApiProperties, createOperationNotice, createUrlProperty } from '../common';

// Define the operation name and display name
export const name = 'map';
export const displayName = '/map';
export const operationName = 'map';
export const resourceName = 'MapSearch';

function createSitemapProperty(): INodeProperties {
	return {
		displayName: 'Sitemap',
		name: 'sitemap',
		type: 'options',
		options: [
			{
				name: 'Include',
				value: 'include',
				description: 'Use sitemap plus link discovery (default, most comprehensive)',
			},
			{
				name: 'Only',
				value: 'only',
				description: 'Only return URLs from sitemap.xml (fastest, but may miss pages)',
			},
			{
				name: 'Skip',
				value: 'skip',
				description: 'Ignore sitemap, discover pages through links only',
			},
		],
		default: 'include',
		description:
			'Control how URLs are discovered. "Include" combines sitemap with link crawling for best coverage. "Only" is fastest but limited to sitemap. "Skip" relies purely on link following.',
		routing: {
			request: {
				body: {
					sitemap: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: [resourceName],
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
		description:
			'Whether to discover URLs on subdomains like blog.example.com or docs.example.com. Enable to map the entire domain ecosystem, not just the main domain.',
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
				resource: [resourceName],
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
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: [resourceName],
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
		description:
			'Maximum time in milliseconds to wait for URL discovery. Increase for large sites or slow connections. Default 10000ms (10 seconds).',
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
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Create additional fields property for custom data
 */
function createAdditionalFieldsProperty(operation: string): INodeProperties {
	return {
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Additional fields to send in the request body',
		options: [
			{
				displayName: 'Custom Properties (JSON)',
				name: 'customProperties',
				type: 'json',
				default: '{}',
				description: 'Custom JSON properties to add to the request body',
			},
		],
		routing: {
			request: {
				body: {
					additionalFields: '={{ $value }}',
				},
			},
			send: {
				preSend: [
					async function (
						this: IExecuteSingleFunctions,
						requestOptions: IHttpRequestOptions,
					): Promise<IHttpRequestOptions> {
						if (typeof requestOptions.body !== 'object' || !requestOptions.body) {
							return requestOptions;
						}

						const body = requestOptions.body as IDataObject;
						const additionalFields = body.additionalFields as IDataObject;

						if (additionalFields) {
							// Handle custom properties JSON
							if (additionalFields.customProperties) {
								try {
									const customProps = JSON.parse(additionalFields.customProperties as string);
									Object.assign(requestOptions.body as IDataObject, customProps);
								} catch (error) {
									// If JSON parsing fails, just skip
								}
							}

							// Remove the additionalFields wrapper
							delete body.additionalFields;
						}

						return requestOptions;
					},
				],
			},
		},
		displayOptions: {
			show: {
				operation: [operation],
				useCustomBody: [true],
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
		createOperationNotice(resourceName, name),

		createUrlProperty(name, undefined, resourceName),

		createSitemapProperty(),

		createIncludeSubdomainsProperty(),

		createLimitProperty(),

		createTimeoutProperty(),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createMapProperties());

// Add the additional fields property separately so it appears only when custom body is enabled
properties.push(createAdditionalFieldsProperty(name));

export { options, properties };
