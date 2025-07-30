import {
	INodeProperties,
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';
import {
	buildApiProperties,
	createOperationNotice,
	createScrapeOptionsProperty,
	createUrlProperty,
} from '../common';

// Define the operation name and display name
export const name = 'crawl';
export const displayName = 'Crawl a website';
export const operationName = 'crawl';

/**
 * Creates the exclude paths property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @returns The exclude paths property
 */
function createExcludePathsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
): INodeProperties {
	return {
		displayName: 'Exclude Paths',
		name: 'excludePaths',
		type: 'fixedCollection',
		default: [],
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Specifies URL patterns to exclude from the crawl by comparing website paths against the provided regex patterns',
		placeholder: 'Add path to exclude',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Path',
						name: 'path',
						type: 'string',
						default: '',
						placeholder: 'blog/*',
						description:
							'Path pattern to exclude (e.g., blog/* will exclude paths like /blog/article-1)',
					},
				],
			},
		],
		routing: {
			request: {
				body: {
					excludePaths: '={{$value.items.map(item => item.path)}}',
				},
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
 * Creates the include paths property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @returns The include paths property
 */
function createIncludePathsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
): INodeProperties {
	return {
		displayName: 'Include Paths',
		name: 'includePaths',
		type: 'fixedCollection',
		default: [],
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Specifies URL patterns to include in the crawl by comparing website paths against the provided regex patterns',
		placeholder: 'Add path to include',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Path',
						name: 'path',
						type: 'string',
						default: '',
						placeholder: 'blog/*',
						description:
							'Path pattern to include (e.g., blog/* will only include paths like /blog/article-1)',
					},
				],
			},
		],
		routing: {
			request: {
				body: {
					includePaths: '={{$value.items.map(item => item.path)}}',
				},
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
 * Creates the max depth property
 * @param operationName - The name of the operation
 * @returns The max depth property
 */
function createMaxDepthProperty(operationName: string): INodeProperties {
	return {
		displayName: 'Max Depth',
		name: 'maxDepth',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 2,
		description: 'Maximum depth to crawl relative to the entered URL',
		routing: {
			request: {
				body: {
					maxDepth: '={{ $value }}',
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
 * Creates the limit property
 * @param operationName - The name of the operation
 * @returns The limit property
 */
function createLimitProperty(operationName: string): INodeProperties {
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
 * Creates the crawl options property
 * @param operationName - The name of the operation
 * @returns The crawl options property
 */
function createCrawlOptionsProperty(operationName: string): INodeProperties {
	return {
		displayName: 'Crawl Options',
		name: 'crawlOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Ignore Sitemap',
				name: 'ignoreSitemap',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore the website sitemap when crawling',
				routing: {
					request: {
						body: {
							ignoreSitemap: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Ignore Query Params',
				name: 'ignoreQueryParameters',
				type: 'boolean',
				default: false,
				description:
					'Whether to ignore the query parameters - not re-scrape the same path with different (or none)',
				routing: {
					request: {
						body: {
							ignoreQueryParameters: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Allow Backward Links',
				name: 'allowBackwardLinks',
				type: 'boolean',
				default: false,
				description:
					'Whether to enable the crawler to navigate from a specific URL to previously linked pages',
				routing: {
					request: {
						body: {
							allowBackwardLinks: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Allow External Links',
				name: 'allowExternalLinks',
				type: 'boolean',
				default: false,
				description: 'Whether to allow the crawler to follow links to external websites',
				routing: {
					request: {
						body: {
							allowExternalLinks: '={{ $value }}',
						},
					},
				},
			},
		],
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
 * Create the properties for the crawl operation
 */
function createCrawlProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// URL input
		createUrlProperty(name, 'https://firecrawl.dev'),

		// Exclude paths
		createExcludePathsProperty(operationName),

		// Include paths
		createIncludePathsProperty(operationName),

		// Max depth
		createMaxDepthProperty(operationName),

		// Limit
		createLimitProperty(operationName),

		// Crawl options
		createCrawlOptionsProperty(operationName),

		// Scrape options
		createScrapeOptionsProperty(operationName),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createCrawlProperties());

// Add the additional fields property separately so it appears only when custom body is enabled
properties.push(createAdditionalFieldsProperty(name));

export { options, properties };
