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
export const name = 'scrape';
export const displayName = 'Scrape a url and get its content';
export const operationName = 'scrape';

/**
 * Creates the parsers property
 * @param operationName - The name of the operation
 * @returns The parsers property
 */
function createParsersProperty(operationName: string): INodeProperties {
	return {
		displayName: 'Parsers',
		name: 'parsers',
		type: 'multiOptions',
		options: [
			{
				name: 'PDF',
				value: 'pdf',
			},
		],
		default: [],
		description:
			'Controls how PDF files are processed during scraping. When PDF parser is enabled, the PDF content is extracted and converted to markdown format, with billing based on the number of pages (1 credit per page). When disabled, the PDF file is returned in base64 encoding with a flat rate of 1 credit total.',
		routing: {
			request: {
				body: {
					parsers: '={{ $value }}',
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
 * Create the properties for the scrape operation
 */
function createScrapeProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name),

		// URL input
		createUrlProperty(name, 'https://firecrawl.dev'),

		// Parsers
		createParsersProperty(operationName),

		// Scrape options
		createScrapeOptionsProperty(operationName, false),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createScrapeProperties());

// Add the additional fields property separately so it appears only when custom body is enabled
properties.push(createAdditionalFieldsProperty(name));

export { options, properties };
