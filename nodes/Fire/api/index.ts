import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

// Import options and properties from each operation
import { options as mapOptions, properties as mapProperties } from './map';
import { options as scrapeOptions, properties as scrapeProperties } from './scrape';
import { options as crawlOptions, properties as crawlProperties } from './crawl';
import { options as getCrawlStatusOptions, properties as getCrawlStatusProperties } from './getCrawlStatus';
import { options as extractOptions, properties as extractProperties } from './extract';
import { options as getExtractStatusOptions, properties as getExtractStatusProperties } from './getExtractStatus';

/**
 * Combined operation options
 */
const operationOptions: INodePropertyOptions[] = [
	mapOptions,
	scrapeOptions,
	crawlOptions,
	getCrawlStatusOptions,
	extractOptions,
	getExtractStatusOptions,
];

/**
 * Combined properties from all operations
 */
const rawProperties: INodeProperties[] = [
	...mapProperties,
	...scrapeProperties,
	...crawlProperties,
	...getCrawlStatusProperties,
	...extractProperties,
	...getExtractStatusProperties,
];

/**
 * Operation selector property
 */
const operationSelector: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['Default'],
		},
	},
	default: 'map',
	options: operationOptions,
};

/**
 * All API properties
 */
export const apiProperties: INodeProperties[] = [
	operationSelector,
	...rawProperties,
];

/**
 * All API methods
 */
export const apiMethods = {
	Default: {
		map: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
		scrape: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
		crawl: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
		getCrawlStatus: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
		extract: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
		getExtractStatus: {
			execute(this: any) {
				return this.helpers.httpRequest as any;
			},
		},
	},
};
