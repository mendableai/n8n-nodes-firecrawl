import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import { buildApiProperties, createOperationNotice, extractUrls, convertToSchema } from '../common';

const name = 'agentAsync';
const displayName = 'Agent (Async) - Returns job ID for manual polling';
export const operationName = 'agentAsync';
export const resourceName = 'Agent';

/**
 * Creates the prompt property (required)
 * @returns The prompt property
 */
function createPromptProperty(): INodeProperties {
	return {
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		description:
			'Natural language description of the data you want to extract (max 10,000 characters). Be specific about what data you need. Examples: "Find the founders of Firecrawl", "Extract pricing information from this page", "Compare features between these products".',
		placeholder: 'e.g., Find the founders of Firecrawl and their roles',
		routing: {
			request: {
				body: {
					prompt: '={{ $value }}',
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
 * Creates the specify URLs toggle property
 * @returns The specify URLs toggle property
 */
function createSpecifyUrlsProperty(): INodeProperties {
	return {
		displayName: 'Specify URLs',
		name: 'specifyUrls',
		type: 'boolean',
		default: false,
		description:
			'Whether to specify URLs for the agent to focus on. If disabled, the agent will autonomously search and navigate the web to find your data.',
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
 * Creates the URLs property (optional)
 * @returns The URLs property
 */
function createUrlsProperty(): INodeProperties {
	return {
		displayName: 'URLs',
		name: 'urls',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		description:
			'URLs to focus the agent on specific pages. Accepts multiple formats: a single URL, multiple URLs separated by commas or newlines, or a JSON array like ["url1", "url2"].',
		placeholder: 'https://example.com/page1\nhttps://example.com/page2',
		routing: {
			request: {
				body: {
					urls: '={{ $value }}',
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

						if (body.urls !== undefined) {
							const rawValue = body.urls;

							// If empty string or null/undefined, remove urls from body
							if (!rawValue || (typeof rawValue === 'string' && !rawValue.trim())) {
								delete body.urls;
								return requestOptions;
							}

							const urlsArray = extractUrls(rawValue);

							// Remove duplicates and empty values
							const uniqueUrls = [...new Set(urlsArray)].filter(Boolean);

							// If no valid URLs found, remove urls from body (it's optional)
							if (uniqueUrls.length === 0) {
								delete body.urls;
							} else {
								body.urls = uniqueUrls;
							}
						}

						return requestOptions;
					},
				],
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: [resourceName],
				operation: [operationName],
				specifyUrls: [true],
			},
		},
	};
}

/**
 * Creates the schema type selector property
 * @returns The schema type property
 */
function createSchemaTypeProperty(): INodeProperties {
	return {
		displayName: 'Schema Type',
		name: 'schemaType',
		type: 'options',
		default: 'none',
		description: 'Optionally define a schema for the extracted data structure',
		options: [
			{
				name: 'None',
				value: 'none',
				description: 'No schema - let the agent determine the output structure',
			},
			{
				name: 'Generate From JSON Example',
				value: 'fromExample',
				description: 'Generate a schema from an example JSON object',
			},
			{
				name: 'Define Using JSON Schema',
				value: 'manual',
				description: 'Define the JSON schema manually',
			},
		],
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
 * Creates the JSON example property for schema generation
 * @returns The JSON example property
 */
function createJsonExampleProperty(): INodeProperties {
	return {
		displayName: 'JSON Example',
		name: 'jsonExample',
		type: 'json',
		default: '{\n  "founders": [\n    {\n      "name": "John Doe",\n      "role": "CEO"\n    }\n  ]\n}',
		description:
			'Provide an example of the JSON structure you want to extract. The schema will be automatically generated from this example.',
		routing: {
			request: {
				body: {
					jsonExample: '={{ $value }}',
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

						// Convert JSON example to schema
						if (body.jsonExample !== undefined) {
							try {
								let example: unknown;
								if (typeof body.jsonExample === 'string') {
									const trimmed = (body.jsonExample as string).trim();
									if (!trimmed) {
										delete body.jsonExample;
										return requestOptions;
									}
									example = JSON.parse(trimmed);
								} else {
									example = body.jsonExample;
								}

								body.schema = convertToSchema(example);
								delete body.jsonExample;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									'Invalid JSON example. Please provide valid JSON.',
								);
							}
						}

						return requestOptions;
					},
				],
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: [resourceName],
				operation: [operationName],
				schemaType: ['fromExample'],
			},
		},
	};
}

/**
 * Creates the schema property for manual JSON Schema definition
 * @returns The schema property
 */
function createSchemaProperty(): INodeProperties {
	return {
		displayName: 'Schema',
		name: 'schema',
		type: 'json',
		default: '{\n  "type": "object",\n  "properties": {\n    "founders": {\n      "type": "array",\n      "items": {\n        "type": "object",\n        "properties": {\n          "name": { "type": "string" },\n          "role": { "type": "string" }\n        }\n      }\n    }\n  }\n}',
		description:
			'JSON Schema defining the structure of extracted data. Use JSON Schema format with type definitions. $refs syntax is currently not supported.',
		routing: {
			request: {
				body: {
					schema: '={{ JSON.parse($value) }}',
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
				schemaType: ['manual'],
			},
		},
	};
}

/**
 * Creates all properties for the agent operation
 * @returns Array of properties for the agent operation
 */
function createAgentProperties(): INodeProperties[] {
	return [
		createOperationNotice(resourceName, name, 'POST'),
		createPromptProperty(),
		createSpecifyUrlsProperty(),
		createUrlsProperty(),
		createSchemaTypeProperty(),
		createJsonExampleProperty(),
		createSchemaProperty(),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createAgentProperties());

// Override the default routing to use the /agent endpoint
options.routing = {
	request: {
		method: 'POST',
		url: '=/agent',
	},
	output: {
		postReceive: [
			{
				type: 'setKeyValue',
				properties: {
					data: '={{$response.body}}',
				},
			},
		],
	},
};

export { options, properties };
