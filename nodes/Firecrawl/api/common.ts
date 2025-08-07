import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { buildPropertiesWithOptions } from '../helpers';

/**
 * Formats an operation name for display
 * @param name - The raw operation name
 * @returns The formatted operation name with proper capitalization
 */
export function formatOperationName(name: string): string {
	// Convert operation name to title case with spaces
	return name
		.split(/(?=[A-Z])/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Creates a standard API operation notice property
 * @param resourceName - The name of the resource
 * @param operationName - The name of the operation
 * @returns A node property for the operation notice
 */
export function createOperationNotice(
	resourceName: string,
	operationName: string,
	method: string = 'POST',
): INodeProperties {
	return {
		displayName: `${method} /${operationName}`,
		name: 'operation',
		type: 'notice',
		typeOptions: {
			theme: 'info',
		},
		default: '',
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Creates a standard URL input property
 * @param operationName - The name of the operation
 * @param defaultUrl - The default URL value
 * @param resourceName - The name of the resource
 * @returns A node property for the URL input
 */
export function createUrlProperty(
	operationName: string,
	defaultUrl: string = 'https://firecrawl.dev',
	resourceName: string = 'Default',
): INodeProperties {
	return {
		displayName: 'Url',
		name: 'url',
		type: 'string',
		default: defaultUrl,
		routing: {
			request: {
				body: {
					url: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Creates the actions property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @returns The actions property
 */
export function createActionsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
): INodeProperties {
	return {
		displayName: 'Actions',
		name: 'actions',
		type: 'fixedCollection',
		default: [],
		typeOptions: {
			multipleValues: true,
		},
		description: 'List of actions to interact with dynamic content before scraping',
		placeholder: 'Add item',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Type',
						type: 'options',
						default: 'wait',
						options: [
							{
								name: 'Click',
								value: 'click',
							},
							{
								name: 'Press',
								value: 'press',
							},
							{
								name: 'Screenshot',
								value: 'screenshot',
							},
							{
								name: 'Scroll',
								value: 'scroll',
							},
							{
								name: 'Wait',
								value: 'wait',
							},
							{
								name: 'Write',
								value: 'write',
							},
						],
						name: 'type',
					},
					{
						displayName: 'Selector',
						type: 'string',
						default: '',
						description: 'The CSS selector for `click` and `write` actions',
						name: 'selector',
						displayOptions: {
							show: {
								type: ['click', /* 'wait', */ 'scroll'],
							},
						},
					},
					{
						displayName: 'Milliseconds',
						type: 'number',
						default: 1000,
						description: 'Milliseconds to wait for `wait` action',
						name: 'milliseconds',
						displayOptions: {
							show: {
								type: ['wait'],
							},
						},
					},
					{
						displayName: 'Full Page',
						type: 'boolean',
						default: false,
						description: 'Whether the screenshot should be full-page or viewport sized',
						name: 'fullPage',
						displayOptions: {
							show: {
								type: ['screenshot'],
							},
						},
					},
					{
						displayName: 'Text',
						type: 'string',
						default: '',
						description: 'Text for `write` action',
						name: 'text',
						displayOptions: {
							show: {
								type: ['write'],
							},
						},
					},
					{
						displayName: 'Key',
						type: 'string',
						default: '',
						description: 'Key for `press` action',
						name: 'key',
						displayOptions: {
							show: {
								type: ['press'],
							},
						},
					},
					{
						displayName: 'Direction',
						type: 'options',
						default: 'down',
						description: 'Direction for `scroll` action',
						name: 'direction',
						options: [
							{
								name: 'Down',
								value: 'down',
							},
							{
								name: 'Up',
								value: 'up',
							},
						],
						displayOptions: {
							show: {
								type: ['scroll'],
							},
						},
					},
				],
			},
		],
		routing: {
			request: {
				body: useNestedScrapeOptions
					? {
							scrapeOptions: {
								actions: '={{Array.isArray($value.items) ? $value.items : []}}',
							},
					  }
					: {
							actions: '={{Array.isArray($value.items) ? $value.items : []}}',
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
 * Creates the actions property
 * @param operationName - The name of the operation
 * @returns The actions property
 */
export function createLocationProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
): INodeProperties {
	return {
		displayName: 'Location',
		name: 'location',
		type: 'fixedCollection',
		default: {},
		description: 'Location settings for the request',
		options: [
			{
				displayName: 'Location Settings',
				name: 'settings',
				values: [
					{
						displayName: 'Country',
						name: 'country',
						type: 'options',
						default: 'US',
						description: "ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU', 'DE', 'JP')",
						options: [
							{
								name: 'US',
								value: 'US',
							},
							{
								name: 'AU',
								value: 'AU',
							},
							{
								name: 'DE',
								value: 'DE',
							},
							{
								name: 'JP',
								value: 'JP',
							},
						],
					},
					{
						displayName: 'Languages',
						name: 'languages',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: true,
						},
						description:
							'Preferred languages and locales for the request in order of priority. Defaults to the language of the specified location. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language',
						options: [
							{
								displayName: 'Language',
								name: 'language',
								values: [
									{
										displayName: 'Code',
										name: 'code',
										type: 'string',
										default: '',
										description: "Language code (e.g., 'en', 'fr', 'de', 'ja')",
									},
								],
							},
						],
					},
				],
			},
		],
		routing: {
			request: {
				body: useNestedScrapeOptions
					? {
							scrapeOptions: {
								location:
									'={{$value.settings ? { country: $value.settings.country, languages: $value.settings.languages?.language?.map(l => l.code) || [] } : undefined}}',
							},
					  }
					: {
							location:
								'={{$value.settings ? { country: $value.settings.country, languages: $value.settings.languages?.language?.map(l => l.code) || [] } : undefined}}',
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
 * Creates the include tags property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @returns The include tags property
 */
export function createIncludeTagsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
): INodeProperties {
	return {
		displayName: 'Include Tags',
		name: 'includeTags',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Specifies tags to include in the output',
		placeholder: 'Add tag to include',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						placeholder: 'header',
						description: 'Tag to include in the output',
					},
				],
			},
		],
		routing: {
			request: {
				body: useNestedScrapeOptions
					? {
							scrapeOptions: {
								includeTags: '={{$value.items ? $value.items.map(item => item.tag) : []}}',
							},
					  }
					: {
							includeTags: '={{$value.items ? $value.items.map(item => item.tag) : []}}',
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
 * Creates the exclude tags property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @returns The exclude tags property
 */
export function createExcludeTagsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
): INodeProperties {
	return {
		displayName: 'Exclude Tags',
		name: 'excludeTags',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Specifies tags to exclude from the output',
		placeholder: 'Add tag to exclude',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						placeholder: 'footer',
						description: 'Tag to exclude from the output',
					},
				],
			},
		],
		routing: {
			request: {
				body: useNestedScrapeOptions
					? {
							scrapeOptions: {
								excludeTags: '={{$value.items ? $value.items.map(item => item.tag) : []}}',
							},
					  }
					: {
							excludeTags: '={{$value.items ? $value.items.map(item => item.tag) : []}}',
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
 * Creates the scrape options property
 * @param operationName - The name of the operation
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @returns The scrape options property
 */
export function createScrapeOptionsProperty(
	operationName: string,
	useNestedScrapeOptions: boolean = true,
): INodeProperties {
	const scrapeOptionsBody = useNestedScrapeOptions
		? { scrapeOptions: '={{$value.options}}' }
		: '={{$value.options}}';
	return {
		displayName: 'Scrape Options',
		name: 'scrapeOptions',
		type: 'fixedCollection',
		default: {},
		description: 'Options for scraping content during the crawl',
		options: [
			{
				displayName: 'Options',
				name: 'options',
				values: [
					{
						displayName: 'Formats',
						name: 'formats',
						type: 'fixedCollection',
						default: [{ type: 'markdown' }],
						typeOptions: {
							multipleValues: true,
						},
						description: 'Output format(s) for the scraped data',
						placeholder: 'Add format',
						options: [
							{
								displayName: 'Format',
								name: 'format',
								values: [
									{
										displayName: 'Type',
										name: 'type',
										type: 'options',
										default: 'markdown',
										description: 'The type of format',
										options: [
											{
												name: 'Change Tracking',
												value: 'changeTracking',
											},
											{
												name: 'HTML',
												value: 'html',
											},
											{
												name: 'JSON',
												value: 'json',
											},
											{
												name: 'Links',
												value: 'links',
											},
											{
												name: 'Markdown',
												value: 'markdown',
											},
											{
												name: 'Raw HTML',
												value: 'rawHtml',
											},
											{
												name: 'Screenshot',
												value: 'screenshot',
											},
											{
												name: 'Summary',
												value: 'summary',
											},
										],
									},
									{
										displayName: 'Prompt',
										name: 'prompt',
										type: 'string',
										default: '',
										description: 'Prompt for JSON format extraction',
										displayOptions: {
											show: {
												type: ['json'],
											},
										},
									},
									{
										displayName: 'Schema',
										name: 'schema',
										type: 'json',
										default: '{}',
										description: 'JSON schema for JSON format extraction',
										displayOptions: {
											show: {
												type: ['json'],
											},
										},
									},
									{
										displayName: 'Modes',
										name: 'modes',
										type: 'multiOptions',
										default: ['git-diff'],
										description: 'Modes for change tracking. At least one mode must be selected.',
										displayOptions: {
											show: {
												type: ['changeTracking'],
											},
										},
										options: [
											{
												name: 'Git Diff',
												value: 'git-diff',
											},
											{
												name: 'JSON',
												value: 'json',
											},
										],
									},
									{
										displayName: 'Schema',
										name: 'schema',
										type: 'json',
										default: '{}',
										description: 'JSON schema for change tracking',
										displayOptions: {
											show: {
												type: ['changeTracking'],
											},
										},
									},
									{
										displayName: 'Prompt',
										name: 'prompt',
										type: 'string',
										default: '',
										description: 'Prompt for change tracking',
										displayOptions: {
											show: {
												type: ['changeTracking'],
											},
										},
									},
									{
										displayName: 'Tag',
										name: 'tag',
										type: 'string',
										default: '',
										description: 'Tag for change tracking',
										displayOptions: {
											show: {
												type: ['changeTracking'],
											},
										},
									},
									{
										displayName: 'Full Page',
										name: 'fullPage',
										type: 'boolean',
										default: false,
										description: 'Whether to capture the full page screenshot',
										displayOptions: {
											show: {
												type: ['screenshot'],
											},
										},
									},
									{
										displayName: 'Quality',
										name: 'quality',
										type: 'number',
										typeOptions: {
											minValue: 1,
											maxValue: 100,
										},
										default: 100,
										description: 'Screenshot quality (1-100)',
										displayOptions: {
											show: {
												type: ['screenshot'],
											},
										},
									},
									{
										displayName: 'Viewport Width',
										name: 'viewportWidth',
										type: 'number',
										typeOptions: {
											minValue: 1,
										},
										default: 1024,
										description: 'Viewport width for screenshot',
										displayOptions: {
											show: {
												type: ['screenshot'],
											},
										},
									},
									{
										displayName: 'Viewport Height',
										name: 'viewportHeight',
										type: 'number',
										typeOptions: {
											minValue: 1,
										},
										default: 768,
										description: 'Viewport height for screenshot',
										displayOptions: {
											show: {
												type: ['screenshot'],
											},
										},
									},
								],
							},
						],
						routing: {
							request: {
								body: {
									formats:
										'={{$value.format ? $value.format.map(f => { if (f.type === "json" || f.type === "changeTracking") { const format = { type: f.type }; if (f.prompt) format.prompt = f.prompt; if (f.schema) format.schema = JSON.parse(f.schema); if (f.modes) format.modes = f.modes; if (f.tag) format.tag = f.tag; return format; } else if (f.type === "screenshot") { const format = { type: f.type }; if (f.fullPage !== undefined) format.fullPage = f.fullPage; if (f.quality !== undefined && f.quality !== "" && f.quality !== null) format.quality = f.quality; if (f.viewportWidth !== undefined && f.viewportWidth !== "" && f.viewportWidth !== null && f.viewportHeight !== undefined && f.viewportHeight !== "" && f.viewportHeight !== null) { format.viewport = { width: f.viewportWidth, height: f.viewportHeight }; } return format; } else { return f.type; } }) : []}}',
								},
							},
						},
					},
					{
						displayName: 'Only Main Content',
						name: 'onlyMainContent',
						type: 'boolean',
						default: true,
						description:
							'Whether to only return the main content of the page excluding headers, navs, footers, etc',
					},
					createIncludeTagsProperty(operationName, true, useNestedScrapeOptions),
					createExcludeTagsProperty(operationName, true, useNestedScrapeOptions),
					{
						displayName: 'Headers',
						name: 'headers',
						type: 'collection',
						default: {},
						description: 'Headers to send with the request',
						options: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Key of the header',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the header',
							},
						],
					},
					{
						displayName: 'Wait For (Ms)',
						name: 'waitFor',
						type: 'number',
						default: 0,
						description: 'Wait milliseconds for the page to load before fetching content',
					},
					{
						displayName: 'Mobile',
						name: 'mobile',
						type: 'boolean',
						default: false,
						description: 'Whether to emulate scraping from a mobile device',
					},
					{
						displayName: 'Skip TLS Verification',
						name: 'skipTlsVerification',
						type: 'boolean',
						default: false,
						description: 'Whether to skip TLS certificate verification when making requests',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description: 'Timeout in milliseconds for the request',
					},
					createActionsProperty(operationName, true, useNestedScrapeOptions),
					createLocationProperty(operationName, true, useNestedScrapeOptions),
					{
						displayName: 'Remove Base64 Images',
						name: 'removeBase64Images',
						type: 'boolean',
						default: true,
						description: 'Whether to remove base64 encoded images from the output',
					},
					{
						displayName: 'Block Ads',
						name: 'blockAds',
						type: 'boolean',
						default: true,
						description: 'Whether to enables ad-blocking and cookie popup blocking',
					},
					{
						displayName: 'Store In Cache',
						name: 'storeInCache',
						type: 'boolean',
						default: true,
						description:
							'Whether to store the page in the Firecrawl index and cache. Disable for data protection concerns or when using sensitive scraping parameters.',
					},
					{
						displayName: 'Proxy',
						name: 'proxy',
						type: 'options',
						default: 'basic',
						description: 'Specifies the type of proxy to use',
						options: [
							{
								name: 'Basic',
								value: 'basic',
							},
							{
								name: 'Stealth',
								value: 'stealth',
							},
						],
					},
				],
			},
		],
		routing: {
			request: {
				body: scrapeOptionsBody,
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
 * Creates a standard API operation option
 * @param name - The name of the operation
 * @param action - The display name for the action
 * @returns A node property option for the operation
 */
export function createOperationOption(name: string, action: string): INodePropertyOptions {
	return {
		name: action,
		value: name,
		action,
		routing: {
			request: {
				method: 'POST',
				url: `=/${name}`,
			},
		},
	};
}

/**
 * Builds API properties with options
 * @param name - The name of the operation
 * @param action - The display name for the action
 * @param properties - The properties for the operation
 * @returns An object containing options and properties
 */
export function buildApiProperties(name: string, action: string, properties: INodeProperties[]) {
	const option = createOperationOption(name, action);
	return buildPropertiesWithOptions(option, properties);
}
