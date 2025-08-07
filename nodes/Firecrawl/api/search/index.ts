import {
	INodeProperties,
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { buildApiProperties } from '../common';
import { createOperationNotice } from '../common';

// Define the operation name and display name
export const name = 'search';
export const displayName = 'Search and optionally scrape search results';
export const operationName = 'search';

/**
 * Create the query property
 */
function createQueryProperty(operationName: string): INodeProperties {
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
				operation: [operationName],
			},
		},
	};
}

/**
 * Create the limit property
 */
function createLimitProperty(operationName: string): INodeProperties {
	return {
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: 5,
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
				operation: [operationName],
			},
			hide: {
				useCustomBody: [true],
			},
		},
	};
}

/**
 * Creates the sources property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @returns The sources property
 */
function createSourcesProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
): INodeProperties {
	return {
		displayName: 'Sources',
		name: 'sources',
		type: 'multiOptions',
		options: [
			{
				name: 'Web',
				value: 'web',
			},
			{
				name: 'Images',
				value: 'images',
			},
			{
				name: 'News',
				value: 'news',
			},
		],
		default: ['web'],
		description: 'Specifies the sources to search from. At least one source must be selected.',
		routing: {
			request: {
				body: {
					sources: '={{$value.map(source => ({ type: source }))}}',
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

						// Ensure at least one source is selected
						if (!body.sources || (Array.isArray(body.sources) && body.sources.length === 0)) {
							throw new Error('At least one source must be selected (web, images, or news)');
						}

						return requestOptions;
					},
				],
			},
		},
		displayOptions: omitDisplayOptions
			? undefined
			: {
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
			hide: {
				useCustomBody: [true],
			},
		},
	};
}

/**
 * Create additional fields property for custom data
 */
function createAdditionalFieldsProperty(operationName: string): INodeProperties {
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
				operation: [operationName],
				useCustomBody: [true],
			},
		},
	};
}

function createTimeoutProperty(operationName: string): INodeProperties {
	return {
		displayName: 'Timeout (Ms)',
		name: 'timeout',
		type: 'number',
		default: 60000,
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
 * Create the properties for the search operation
 */
function createSearchProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// Required parameters
		createQueryProperty(name),

		// Sources
		createSourcesProperty(name),

		// Timeout
		createTimeoutProperty(name),

		// Optional parameters
		createLimitProperty(name),
		createTimeBasedSearchProperty(name),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createSearchProperties());

// Add the additional fields property separately so it appears only when custom body is enabled
properties.push(createAdditionalFieldsProperty(name));

export { options, properties };
