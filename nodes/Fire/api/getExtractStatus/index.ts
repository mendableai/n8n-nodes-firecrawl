import { INodeProperties } from 'n8n-workflow';
import { buildApiProperties, createOperationNotice } from '../common';

const name = 'getExtractStatus';
const displayName = 'Get Extract Status';
export const operationName = 'getExtractStatus';

/**
 * Creates the extract ID property
 * @returns The extract ID property
 */
function createExtractIdProperty(): INodeProperties {
	return {
		displayName: 'Extract ID',
		name: 'extractId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the extract job to get status for',
		placeholder: '1234abcd-5678-efgh-9012-ijklmnopqrst',
		routing: {
			request: {
				url: '=/extract/{{$value}}',
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
 * Creates all properties for the get extract status operation
 * @returns Array of properties for the get extract status operation
 */
function createGetExtractStatusProperties(): INodeProperties[] {

	return [
		createOperationNotice('Default', name, 'GET'),
		createExtractIdProperty()];
}

// Build and export the properties and options
const { options, properties } = buildApiProperties(name, displayName, createGetExtractStatusProperties());

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
