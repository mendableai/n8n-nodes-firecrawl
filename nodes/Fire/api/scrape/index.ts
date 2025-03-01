import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties, createOperationNotice, createUrlProperty } from '../common';

// Define the operation name and display name
export const name = 'scrape';
export const displayName = 'Scrape a url and get its content';

/**
 * Creates the format options property
 * @returns The formats property
 */
function createFormatsProperty(): INodeProperties {
	return {
		displayName: 'Formats',
		name: 'formats',
		type: 'multiOptions',
		default: [],
		description: 'Output format(s) for the scraped data',
		options: [
			{
				name: 'Markdown',
				value: 'markdown',
			},
			{
				name: 'Html',
				value: 'html',
			},
			{
				name: 'Extract',
				value: 'extract',
			},
		],
		routing: {
			request: {
				body: {
					formats: '={{ $value }}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: ['Scrape a url and get its content'],
			},
		},
	};
}

/**
 * Creates the extract options property
 * @returns The extract property
 */
function createExtractProperty(): INodeProperties {
	return {
		displayName: 'Extract',
		name: 'extract',
		type: 'fixedCollection',
		default: {},
		description: undefined,
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Schema',
						type: 'string',
						default: '',
						description: 'The schema for structured data extraction',
						name: 'schema',
					},
					{
						displayName: 'Systemprompt',
						type: 'string',
						default: '',
						description: 'The system prompt used for extraction',
						name: 'systemPrompt',
					},
					{
						displayName: 'Prompt',
						type: 'string',
						default: '',
						description: 'Extraction prompt without schema',
						name: 'prompt',
					},
				],
			},
		],
		routing: {
			request: {
				body: {
					extract: '={{$value.items}}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: ['Scrape a url and get its content'],
				formats: ['extract'],
			},
		},
	};
}

/**
 * Creates the actions property
 * @returns The actions property
 */
function createActionsProperty(): INodeProperties {
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
					},
					{
						displayName: 'Milliseconds',
						type: 'number',
						default: 0,
						description: 'Milliseconds to wait for `wait` action',
						name: 'milliseconds',
					},
					{
						displayName: 'Text',
						type: 'string',
						default: '',
						description: 'Text for `write` action',
						name: 'text',
					},
					{
						displayName: 'Key',
						type: 'string',
						default: '',
						description: 'Key for `press` action',
						name: 'key',
					},
				],
			},
		],
		routing: {
			request: {
				body: {
					actions: '={{$value.items}}',
				},
			},
		},
		displayOptions: {
			hide: {
				useCustomBody: [true],
			},
			show: {
				resource: ['Default'],
				operation: ['Scrape a url and get its content'],
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
		createUrlProperty(name),

		// Format options
		createFormatsProperty(),

		// Extract options
		createExtractProperty(),

		// Actions
		createActionsProperty(),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createScrapeProperties());

export { options, properties };
