import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties, createOperationNotice /* createUrlProperty */ } from '../common';

// Define the operation name and display name
export const name = 'getCrawlStatus';
export const displayName = 'Get crawl status';

export const operationName = 'getCrawlStatus';

/**
 * Creates the crawl ID property
 * @returns The crawl ID property
 */
function createCrawlIdProperty(): INodeProperties {
	return {
		displayName: 'Crawl ID',
		name: 'crawlId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the crawl job to get status for',
		placeholder: '1234abcd-5678-efgh-9012-ijklmnopqrst',
		routing: {
			request: {
				url: '=/crawl/{{$value}}',
			},
		},
		displayOptions: {
			show: {
				resource: ['Default'],
				operation: [operationName],
			},
		},
	};
}

/**
 * Create the properties for the getCrawlStatus operation
 */
function createGetCrawlStatusProperties(): INodeProperties[] {
	return [
		// Operation notice
		createOperationNotice('Default', name, 'GET'),

		// Crawl ID input
		createCrawlIdProperty(),
	];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(
	name,
	displayName,
	createGetCrawlStatusProperties(),
);

// Override the default routing for this operation
options.routing = {
	request: {
		method: 'GET',
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
