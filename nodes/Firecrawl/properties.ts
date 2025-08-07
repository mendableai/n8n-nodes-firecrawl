import { INodeProperties } from 'n8n-workflow';
import { apiProperties } from './api';
import { preSendActionCustomBody } from './helpers';

/**
 * Authentication properties for the Firecrawl API
 */
export const authenticationProperties: INodeProperties[] = [];

/**
 * Resource selector properties
 */
export const resourceSelect: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'hidden',
		noDataExpression: true,
		options: [
			{
				name: 'Default',
				value: 'Default',
			},
		],
		default: 'Default',
	},
];

/**
 * Extra properties for custom body options
 */
export const extraProperties: INodeProperties[] = [
	{
		displayName: 'Use Custom Body',
		name: 'useCustomBody',
		type: 'boolean',
		description: 'Whether to use a custom body',
		default: false,
	},
	{
		displayName: 'Custom Body',
		name: 'customBody',
		type: 'json',
		default:
			'{\n  "url": "string",\n  "limit": 0,\n  "excludePaths": [\n    "string"\n  ],\n  "webhook": "string",\n  "scrapeOptions": {\n    "formats": [\n      {\n        "type": "markdown"\n      }\n    ],\n    "extract": {\n      "schema": "string",\n      "systemPrompt": "string",\n      "prompt": "string"\n    }\n  }\n}',
		description: 'Custom body to send',
		routing: {
			request: {
				body: {
					customBody: '={{JSON.parse($value)}}',
				},
			},
			send: {
				preSend: [preSendActionCustomBody],
			},
		},
		displayOptions: {
			show: {
				useCustomBody: [true],
				resource: ['Default'],
				operation: ['Submit A Crawl Job'],
			},
		},
	},
	{
		displayName: 'Custom Body',
		name: 'customBody',
		type: 'json',
		default:
			'{\n  "url": "string",\n  "excludePaths": [\n    "string"\n  ],\n  "limit": 0,\n  "scrapeOptions": {\n    "formats": [\n      {\n        "type": "markdown"\n      }\n    ],\n    "extract": {\n      "schema": "string",\n      "systemPrompt": "string",\n      "prompt": "string"\n    }\n  }\n}',
		description: 'Custom body to send',
		routing: {
			request: {
				body: {
					customBody: '={{JSON.parse($value)}}',
				},
			},
			send: {
				preSend: [preSendActionCustomBody],
			},
		},
		displayOptions: {
			show: {
				useCustomBody: [true],
				resource: ['Default'],
				operation: ['Crawl url with websocket monitoring'],
			},
		},
	},
	{
		displayName: 'Custom Body',
		name: 'customBody',
		type: 'json',
		default:
			'{\n  "url": "string",\n  "limit": 0,\n  "webhook": "string",\n  "excludePaths": [\n    "string"\n  ],\n  "scrapeOptions": {\n    "formats": [\n      {\n        "type": "markdown"\n      }\n    ],\n    "extract": {\n      "schema": "string",\n      "systemPrompt": "string",\n      "prompt": "string"\n    }\n  }\n}',
		description: 'Custom body to send',
		routing: {
			request: {
				body: {
					customBody: '={{JSON.parse($value)}}',
				},
			},
			send: {
				preSend: [preSendActionCustomBody],
			},
		},
		displayOptions: {
			show: {
				useCustomBody: [true],
				resource: ['Default'],
				operation: ['Submit A Crawl Job With A Webhook'],
			},
		},
	},
	{
		displayName: 'Custom Body',
		name: 'customBody',
		type: 'json',
		default:
			'{\n  "url": "string",\n  "formats": [\n    {\n      "type": "markdown"\n    }\n  ],\n  "extract": {\n    "schema": "string",\n    "systemPrompt": "string",\n    "prompt": "string"\n  },\n  "actions": [\n    {\n      "type": "wait",\n      "selector": "string",\n      "milliseconds": 0,\n      "text": "string",\n      "key": "string"\n    }\n  ]\n}',
		description: 'Custom body to send',
		routing: {
			request: {
				body: {
					customBody: '={{JSON.parse($value)}}',
				},
			},
			send: {
				preSend: [preSendActionCustomBody],
			},
		},
		displayOptions: {
			show: {
				useCustomBody: [true],
				resource: ['Default'],
				operation: ['Scrape a url and get its content'],
			},
		},
	},
	{
		displayName: 'Custom Body',
		name: 'customBody',
		type: 'json',
		default: '{\n  "url": "https://firecrawl.dev",\n  "search": "docs"\n}',
		description: 'Custom body to send',
		routing: {
			request: {
				body: {
					customBody: '={{JSON.parse($value)}}',
				},
			},
			send: {
				preSend: [preSendActionCustomBody],
			},
		},
		displayOptions: {
			show: {
				useCustomBody: [true],
				resource: ['Default'],
				operation: ['Map a website and get urls'],
			},
		},
	},
];

/**
 * Custom body for crawl operation
 */
const customBodyCrawl: INodeProperties = {
	displayName: 'Custom Body',
	name: 'customBody',
	type: 'json',
	default: `{
  "url": "https://firecrawl.dev",
  "excludePaths": ["blog/*"],
  "includePaths": [],
  "prompt": "Get the latest news from the blog",
  "limit": 100,
  "crawlOptions": {
    "ignoreSitemap": false,
    "allowBackwardLinks": false,
    "allowExternalLinks": false
  },
  "scrapeOptions": {
    "formats": [
      {
        "type": "markdown"
      }
    ],
    "onlyMainContent": true,
    "removeBase64Images": true,
    "mobile": false,
    "waitFor": 0
  },
  "webhook": ""
}`,
	description: 'Custom body to send',
	routing: {
		request: {
			body: '={{JSON.parse($value)}}',
		},
	},
	displayOptions: {
		show: {
			resource: ['Default'],
			operation: ['Crawl a website'],
			useCustomBody: [true],
		},
	},
};

/**
 * Combine all properties into a single array
 */
export const allProperties = [
	...authenticationProperties,
	...resourceSelect,
	...apiProperties,
	...extraProperties,
	customBodyCrawl,
];
