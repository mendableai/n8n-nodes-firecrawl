import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

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
		requestOptions.body = {
			...requestOptions.body,
			...customBody,
		};

		// Remove the customBody property as it's no longer needed
		delete (requestOptions.body as IDataObject).customBody;
	}

	return Promise.resolve(requestOptions);
}
