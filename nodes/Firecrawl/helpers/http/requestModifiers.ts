import { IDataObject, IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';

/**
 * Modifies the request options to include custom body properties
 * @param requestOptions - The original HTTP request options
 * @returns The modified HTTP request options with custom body merged
 */
export async function mergeCustomBodyWithRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const { customBody } = requestOptions.body as IDataObject;

	if (typeof requestOptions.body === 'object' && typeof customBody === 'object') {
		// Store the integration value before merging
		const integration = (requestOptions.body as IDataObject).integration;

		requestOptions.body = {
			...requestOptions.body,
			...customBody,
		};

		// Remove the customBody property as it's no longer needed
		delete (requestOptions.body as IDataObject).customBody;

		// Restore the integration value if it was set
		if (integration) {
			(requestOptions.body as IDataObject).integration = integration;
		}
	}

	return Promise.resolve(requestOptions);
}
