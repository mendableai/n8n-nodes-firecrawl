import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { buildPropertiesWithOptions } from '../helpers';

/**
 * Normalizes a URL by adding https:// if no protocol is present
 * @param url - The URL string to normalize
 * @returns The normalized URL with protocol
 */
function normalizeUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) return '';
	// If URL already has a protocol, return as-is
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return trimmed;
	}
	// Add https:// prefix for URLs without protocol
	return `https://${trimmed}`;
}

/**
 * Checks if a string looks like a valid URL (with or without protocol)
 * @param str - The string to check
 * @returns True if the string looks like a URL
 */
function looksLikeUrl(str: string): boolean {
	const trimmed = str.trim();
	if (!trimmed) return false;
	// Already has protocol
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return true;
	}
	// Check if it looks like a domain (contains a dot and no spaces)
	return trimmed.includes('.') && !trimmed.includes(' ');
}

/**
 * Extracts URLs from various input formats
 * Handles: JSON arrays, newline-separated, comma-separated, space-separated, and single URLs
 * URLs without a protocol (e.g., "example.com") will have https:// prepended
 * @param val - The input value to extract URLs from
 * @returns An array of URL strings
 */
export function extractUrls(val: unknown): string[] {
	// Already an array - flatten and extract strings
	if (Array.isArray(val)) {
		return val.flatMap(extractUrls);
	}

	// String input - try various parsing strategies
	if (typeof val === 'string') {
		const trimmed = val.trim();
		if (!trimmed) return [];

		// Try parsing as JSON array first
		if (trimmed.startsWith('[')) {
			try {
				const parsed = JSON.parse(trimmed);
				return extractUrls(parsed);
			} catch {
				// Not valid JSON, continue with other methods
			}
		}

		// Check for newlines (most common for pasted lists)
		if (trimmed.includes('\n')) {
			return trimmed
				.split('\n')
				.map((u) => u.trim())
				.filter(looksLikeUrl)
				.map(normalizeUrl);
		}

		// Check for comma separation
		if (trimmed.includes(',')) {
			return trimmed
				.split(',')
				.map((u) => u.trim())
				.filter(looksLikeUrl)
				.map(normalizeUrl);
		}

		// Check for space separation (multiple URLs with http)
		if (trimmed.includes(' http')) {
			return trimmed
				.split(/\s+/)
				.map((u) => u.trim())
				.filter(looksLikeUrl)
				.map(normalizeUrl);
		}

		// Single URL (with or without protocol)
		if (looksLikeUrl(trimmed)) {
			return [normalizeUrl(trimmed)];
		}

		return [];
	}

	// Object with url property
	if (typeof val === 'object' && val !== null && 'url' in val) {
		const urlVal = (val as { url: unknown }).url;
		if (typeof urlVal === 'string' && looksLikeUrl(urlVal)) {
			return [normalizeUrl(urlVal)];
		}
	}

	return [];
}

/**
 * Converts a JavaScript value to a JSON Schema
 * @param value - The value to convert to a schema
 * @returns A JSON Schema object representing the value's structure
 */
export function convertToSchema(value: unknown): Record<string, unknown> {
	if (value === null) {
		return { type: 'null' };
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return { type: 'array', items: {} };
		}
		return {
			type: 'array',
			items: convertToSchema(value[0]),
		};
	}

	switch (typeof value) {
		case 'string':
			return { type: 'string' };
		case 'number':
			return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
		case 'boolean':
			return { type: 'boolean' };
		case 'object': {
			const properties: Record<string, unknown> = {};
			for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
				properties[key] = convertToSchema(val);
			}
			return {
				type: 'object',
				properties,
			};
		}
		default:
			return {};
	}
}

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
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: defaultUrl,
		required: true,
		description:
			'The target webpage URL to scrape or crawl. Must be a valid HTTP/HTTPS URL (e.g., https://example.com). The URL should be publicly accessible or behind authentication configured in headers.',
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
 * Turns an `includeTags`/`excludeTags` fixedCollection into the string array the API
 * expects. Blank rows are dropped, and the field is omitted entirely when no tag is
 * configured rather than sending an empty array.
 */
const TAGS_EXPRESSION =
	'={{Array.isArray($value.items) && $value.items.some(item => item.tag) ? $value.items.map(item => item.tag).filter(tag => tag) : undefined}}';

/**
 * Creates the actions property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @param resourceName - The name of the resource
 * @returns The actions property
 */
export function createActionsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
	resourceName: string = 'Scraping',
): INodeProperties {
	return {
		displayName: 'Actions',
		name: 'actions',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Pre-scraping automation actions to interact with dynamic content. Use these to handle JavaScript-rendered pages, click buttons, fill forms, scroll to load more content, or wait for elements. Actions execute in order before content extraction.',
		placeholder: 'Add action',
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
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
						displayName: 'Key',
						type: 'string',
						default: '',
						description:
							'Keyboard key to press (e.g., "Enter", "Tab", "Escape", "ArrowDown"). Use for form submission, navigation, or triggering keyboard shortcuts.',
						name: 'key',
						displayOptions: {
							show: {
								type: ['press'],
							},
						},
					},
					{
						displayName: 'Milliseconds',
						type: 'number',
						default: 1000,
						description:
							'Time to wait in milliseconds. Use this to allow JavaScript content to load or animations to complete. Typical values: 1000-3000ms for most pages, 5000ms+ for heavy SPAs.',
						name: 'milliseconds',
						displayOptions: {
							show: {
								type: ['wait'],
							},
						},
					},
					{
						displayName: 'Selector',
						type: 'string',
						default: '',
						description:
							'CSS selector to target an element (e.g., "#submit-btn", ".load-more", "[data-testid=login]"). Used for click, write, and scroll actions.',
						name: 'selector',
						displayOptions: {
							show: {
								type: ['click', /* 'wait', */ 'scroll'],
							},
						},
					},
					{
						displayName: 'Text',
						type: 'string',
						default: '',
						description:
							'Text to type into an input field. Use with selector to target the input element. Useful for search boxes, login forms, or any text input.',
						name: 'text',
						displayOptions: {
							show: {
								type: ['write'],
							},
						},
					},
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
				],
			},
		],
		routing: {
			request: {
				body: useNestedScrapeOptions
					? {
							scrapeOptions: {
								actions: '={{Array.isArray($value.items) && $value.items.length > 0 ? $value.items : undefined}}',
							},
					  }
					: {
							actions: '={{Array.isArray($value.items) && $value.items.length > 0 ? $value.items : undefined}}',
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
						resource: [resourceName],
						operation: [operationName],
					},
			  },
	};
}

/**
 * Creates the location property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @param resourceName - The name of the resource
 * @returns The location property
 */
export function createLocationProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
	resourceName: string = 'Scraping',
): INodeProperties {
	return {
		displayName: 'Location',
		name: 'location',
		type: 'fixedCollection',
		default: {},
		description:
			'Geographic location settings for the request. Use this to access geo-restricted content or see region-specific versions of websites. Affects IP geolocation and Accept-Language headers.',
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
						resource: [resourceName],
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
 * @param resourceName - The name of the resource
 * @returns The include tags property
 */
export function createIncludeTagsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
	resourceName: string = 'Scraping',
): INodeProperties {
	return {
		displayName: 'Include Tags',
		name: 'includeTags',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'HTML tags to retain in the output. Only content within these tags will be included. Useful for extracting specific sections like article content, product details, or main content areas.',
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
								includeTags: TAGS_EXPRESSION,
							},
					  }
					: {
							includeTags: TAGS_EXPRESSION,
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
						resource: [resourceName],
						operation: [operationName],
					},
			  },
	};
}

/**
 * Creates a batch URL input property for multiple URLs
 * @param operationName - The name of the operation
 * @param defaultUrl - The default URL value
 * @param resourceName - The name of the resource
 * @returns A node property for batch URL inputs
 */
export function createBatchUrlsProperty(
	operationName: string,
	defaultUrl: string = 'https://firecrawl.dev',
	resourceName: string = 'Default',
): INodeProperties {
	return {
		displayName: 'URLs',
		name: 'urls',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: defaultUrl,
		required: true,
		description:
			'URLs to scrape in batch. Accepts multiple formats: a single URL, multiple URLs separated by commas or newlines, a JSON array like ["url1", "url2"], or an array expression from a previous node. Each URL is scraped independently with the same settings. Example: "https://example.com/page1, https://example.com/page2" or paste one URL per line.',
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
							const urlsArray = extractUrls(rawValue);

							// Remove duplicates and empty values
							const uniqueUrls = [...new Set(urlsArray)].filter(Boolean);

							if (uniqueUrls.length === 0) {
								throw new Error(
									'At least one valid URL is required. Provide URLs as a single URL, comma-separated list, one per line, or a JSON array.',
								);
							}

							body.urls = uniqueUrls;
						}

						return requestOptions;
					},
				],
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
 * Creates the exclude tags property
 * @param operationName - The name of the operation
 * @param omitDisplayOptions - Whether to omit the display options
 * @param useNestedScrapeOptions - Whether to use nested scrape options
 * @param resourceName - The name of the resource
 * @returns The exclude tags property
 */
export function createExcludeTagsProperty(
	operationName: string,
	omitDisplayOptions: boolean = false,
	useNestedScrapeOptions: boolean = true,
	resourceName: string = 'Scraping',
): INodeProperties {
	return {
		displayName: 'Exclude Tags',
		name: 'excludeTags',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'HTML tags to remove from the output. Content within these tags will be excluded. Common uses: removing navigation (nav), sidebars (aside), footers, ads, or cookie banners.',
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
								excludeTags: TAGS_EXPRESSION,
							},
					  }
					: {
							excludeTags: TAGS_EXPRESSION,
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
						resource: [resourceName],
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

/**
 * Creates batch-specific properties for scrape options
 * @returns Array of batch-specific node properties
 */
function createBatchSpecificProperties(): INodeProperties[] {
	return [
		{
			displayName: 'Webhook',
			name: 'webhook',
			type: 'fixedCollection',
			default: {},
			description:
				'Configure webhook notifications for batch job progress. Receive real-time updates when scraping starts, completes each page, finishes, or fails. Ideal for monitoring long-running jobs.',
			options: [
				{
					displayName: 'Webhook Settings',
					name: 'settings',
					values: [
						{
							displayName: 'URL',
							name: 'url',
							type: 'string',
							required: true,
							default: '',
							description:
								'The URL to send the webhook to. Triggers for batchScrape.started, batchScrape.page, batchScrape.completed, or batchScrape.failed events.',
						},
						{
							displayName: 'Headers',
							name: 'headers',
							type: 'fixedCollection',
							default: {},
							typeOptions: {
								multipleValues: true,
							},
							description: 'Headers to send to the webhook URL',
							options: [
								{
									displayName: 'Header',
									name: 'header',
									values: [
										{
											displayName: 'Key',
											name: 'key',
											type: 'string',
											default: '',
											description: 'Header key',
										},
										{
											displayName: 'Value',
											name: 'value',
											type: 'string',
											default: '',
											description: 'Header value',
										},
									],
								},
							],
						},
						{
							displayName: 'Metadata',
							name: 'metadata',
							type: 'json',
							default: '{}',
							description:
								'Custom metadata that will be included in all webhook payloads for this crawl',
						},
						{
							displayName: 'Events',
							name: 'events',
							type: 'multiOptions',
							options: [
								{
									name: 'Started',
									value: 'started',
								},
								{
									name: 'Page',
									value: 'page',
								},
								{
									name: 'Completed',
									value: 'completed',
								},
								{
									name: 'Failed',
									value: 'failed',
								},
							],
							default: ['completed', 'page', 'failed', 'started'],
							description: 'Type of events that should be sent to the webhook URL',
						},
					],
				},
			],
			routing: {
				request: {
					body: {
						webhook:
							'={{$value.settings ? { url: $value.settings.url, headers: $value.settings.headers?.header?.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}) || {}, metadata: $value.settings.metadata ? JSON.parse($value.settings.metadata) : {}, events: $value.settings.events || [] } : undefined}}',
					},
				},
			},
		},
		{
			displayName: 'Max Concurrency',
			name: 'maxConcurrency',
			type: 'number',
			default: 100,
			description:
				'Maximum number of URLs to scrape simultaneously. Higher values speed up batch jobs but may trigger rate limits. Leave at default to use your team\'s plan limit.',
		},
		{
			displayName: 'Ignore Invalid URLs',
			name: 'ignoreInvalidURLs',
			type: 'boolean',
			default: true,
			description:
				'Whether to continue processing valid URLs even if some are malformed or inaccessible. When disabled, the entire batch fails if any URL is invalid.',
		},
		{
			displayName: 'Store In Cache',
			name: 'storeInCache',
			type: 'boolean',
			default: true,
			description:
				'Whether to cache scraped pages for faster subsequent requests. Disable for privacy-sensitive scraping or when you need fresh data on every request.',
		},
		{
			displayName: 'Zero Data Retention',
			name: 'zeroDataRetention',
			type: 'boolean',
			default: false,
			description:
				'Whether to delete all scraped data from Firecrawl servers immediately after returning results. Enable for maximum privacy compliance (GDPR, HIPAA). Requires special account access.',
		},
	];
}

/**
 * Options inside the scrape options collection that define their own `routing`.
 *
 * Their raw n8n value is a `fixedCollection` wrapper (`{ format: [...] }`,
 * `{ items: [...] }`, `{ settings: {...} }` or `{}` when untouched), not the shape the
 * API expects. Each of them already serialises itself through its own routing, so the
 * raw value must be stripped from the collection before it is spread into the request
 * body - otherwise it leaks through and the API rejects the request with a 400
 * ("expected array, received object").
 */
const SELF_ROUTED_SCRAPE_OPTIONS = [
	'formats',
	'includeTags',
	'excludeTags',
	'actions',
	'location',
	'webhook',
];

export function createScrapeOptionsProperty(
	operationName: string,
	useNestedScrapeOptions: boolean = true,
	batchMode: boolean = false,
	resourceName: string = 'Scraping',
): INodeProperties {
	const rawScrapeOptions = `={{Object.fromEntries(Object.entries($value.options || {}).filter(([k]) => !${JSON.stringify(
		SELF_ROUTED_SCRAPE_OPTIONS,
	)}.includes(k)))}}`;
	const scrapeOptionsBody = useNestedScrapeOptions
		? { scrapeOptions: rawScrapeOptions }
		: rawScrapeOptions;
	// Turns the `formats` fixedCollection into the array the API expects. Omitted entirely
	// when no format is configured so the API falls back to its own default.
	const formatsExpression =
		'={{Array.isArray($value.format) && $value.format.length > 0 ? $value.format.map(f => { if (f.type === "json" || f.type === "changeTracking") { const format = { type: f.type }; if (f.prompt) format.prompt = f.prompt; if (f.schema) { const schema = JSON.parse(f.schema); if (Object.keys(schema).length > 0) format.schema = schema; } if (f.modes) format.modes = f.modes; if (f.tag) format.tag = f.tag; return format; } else if (f.type === "screenshot") { const format = { type: f.type }; if (f.fullPage !== undefined) format.fullPage = f.fullPage; if (f.quality !== undefined && f.quality !== "" && f.quality !== null) format.quality = f.quality; if (f.viewportWidth !== undefined && f.viewportWidth !== "" && f.viewportWidth !== null && f.viewportHeight !== undefined && f.viewportHeight !== "" && f.viewportHeight !== null) { format.viewport = { width: f.viewportWidth, height: f.viewportHeight }; } return format; } else { return f.type; } }) : undefined}}';
	return {
		displayName: 'Scrape Options',
		name: 'scrapeOptions',
		type: 'fixedCollection',
		default: {},
		description:
			'Configure how content is extracted from pages. Control output formats (markdown, HTML, JSON), content filtering, timing, caching, and browser emulation settings.',
		options: [
			{
				displayName: 'Options',
				name: 'options',
				values: [
					{
						displayName: 'Block Ads',
						name: 'blockAds',
						type: 'boolean',
						default: true,
						description:
							'Whether to enable ad-blocking and cookie consent popup blocking for cleaner content extraction. Recommended for most scraping tasks.',
					},
					{
						displayName: 'Formats',
						name: 'formats',
						type: 'fixedCollection',
						default: { format: [{ type: 'markdown' }] },
						typeOptions: {
							multipleValues: true,
						},
						description:
							'Output format(s) for scraped content. Use "Summary" when user wants a brief overview or summary of the page. Use "Markdown" for full content (best for AI/LLM). HTML preserves structure. JSON enables structured data extraction. Screenshot captures visual representation.',
						placeholder: 'Add format',
						options: [
							{
								displayName: 'Format',
								name: 'format',
								values: [
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
										displayName: 'Type',
										name: 'type',
										type: 'options',
										default: 'markdown',
										description:
										'Output format for scraped content. Use "Summary" when user asks for a summary, overview, or condensed version of page content. Use "Markdown" for full content in AI-readable format.',
										options: [
											{
												name: 'Change Tracking',
												value: 'changeTracking',
												description: 'Track changes between page versions over time',
											},
											{
												name: 'HTML',
												value: 'html',
												description: 'Clean HTML with scripts and styles removed',
											},
											{
												name: 'JSON',
												value: 'json',
												description: 'Extract structured data using AI with a schema',
											},
											{
												name: 'Links',
												value: 'links',
												description: 'Extract all links from the page',
											},
											{
												name: 'Markdown',
												value: 'markdown',
												description: 'Full page content as markdown - best for AI/LLM processing and reading full content',
											},
											{
												name: 'Raw HTML',
												value: 'rawHtml',
												description: 'Original HTML including scripts and styles',
											},
											{
												name: 'Screenshot',
												value: 'screenshot',
												description: 'Visual screenshot of the page as base64 image',
											},
											{
												name: 'Summary',
												value: 'summary',
												description:
													'AI-generated concise summary of page content - USE THIS when user asks for a summary, overview, brief description, or wants to quickly understand what a page is about',
											},
										],
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
								],
							},
						],
						routing: {
							request: {
								body: useNestedScrapeOptions
									? { scrapeOptions: { formats: formatsExpression } }
									: { formats: formatsExpression },
							},
						},
					},
					createIncludeTagsProperty(operationName, true, useNestedScrapeOptions),
					createExcludeTagsProperty(operationName, true, useNestedScrapeOptions),
					{
						displayName: 'Headers',
						name: 'headers',
						type: 'collection',
						default: {},
						description:
							'Custom HTTP headers to send with the request. Use for authentication tokens, cookies, custom user-agents, or API keys required by the target website.',
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
						displayName: 'Mobile',
						name: 'mobile',
						type: 'boolean',
						default: false,
						description:
							'Whether to emulate a mobile device when scraping. Useful for sites with mobile-specific content, responsive layouts, or mobile-only features. Changes viewport and user-agent.',
					},
					{
						displayName: 'Only Main Content',
						name: 'onlyMainContent',
						type: 'boolean',
						default: true,
						description:
							'Whether to automatically remove navigation, headers, footers, sidebars, and other boilerplate content. Best for extracting article text or primary page content. Disable to capture the full page.',
					},
					{
						displayName: 'Proxy',
						name: 'proxy',
						type: 'options',
						default: 'basic',
						description:
							'Proxy strategy for bypassing anti-bot measures. Basic is faster and cheaper. Stealth uses residential proxies for better success on protected sites.',
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
					{
						displayName: 'Remove Base64 Images',
						name: 'removeBase64Images',
						type: 'boolean',
						default: true,
						description:
							'Whether to strip embedded base64 images from output while preserving alt text. Reduces output size significantly. Disable if you need inline image data.',
					},
					createActionsProperty(operationName, true, useNestedScrapeOptions),
					createLocationProperty(operationName, true, useNestedScrapeOptions),
					{
						displayName: 'Skip TLS Verification',
						name: 'skipTlsVerification',
						type: 'boolean',
						default: false,
						description:
							'Whether to bypass SSL/TLS certificate validation. Enable for sites with self-signed or expired certificates. Use with caution as it reduces security.',
					},
					{
						displayName: 'Store In Cache',
						name: 'storeInCache',
						type: 'boolean',
						default: true,
						description:
							'Whether to cache the scraped page for faster subsequent requests. Disable for real-time data needs, sensitive content, or when privacy is a concern.',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description:
							'Maximum time in milliseconds to wait for the page to load. Increase for slow sites or complex pages. Default 30000ms (30 seconds).',
					},
					{
						displayName: 'Wait For (Ms)',
						name: 'waitFor',
						type: 'number',
						default: 0,
						description:
							'Additional wait time in milliseconds after page load before extracting content. Use for JavaScript-heavy sites where content renders dynamically. 0 uses intelligent auto-detection.',
					},
					...(batchMode ? createBatchSpecificProperties() : []),
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
				resource: [resourceName],
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
