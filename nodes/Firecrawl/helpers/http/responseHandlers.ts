import {
	BinaryFileType,
	IBinaryData,
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
} from 'n8n-workflow';
import { PostReceiveAction } from '../types';

/**
 * Extracts the content type from an HTTP response
 * @param response - The HTTP response
 * @returns The content type string
 */
export function getResponseContentType(response: IN8nHttpFullResponse): string {
	return response.headers['content-type'] as string;
}

/**
 * Extracts the file type from a content type string
 * @param contentType - The content type string
 * @returns The file type
 */
export function getFileTypeFromContentType(contentType: string): string {
	const type = contentType.split(';')[0].trim();

	if (type.includes('/')) {
		return type.split('/')[0];
	}

	return type;
}

/**
 * Extracts the file extension from a content type string
 * @param contentType - The content type string
 * @returns The file extension
 */
export function getFileExtensionFromContentType(contentType: string): string {
	const type = contentType.split(';')[0].trim();

	// any/thing -> thing
	if (typeof type === 'string' && type.includes('/')) {
		return type.split('/')[1];
	}

	return type;
}

/**
 * Determines if a response should be treated as binary based on its content type
 * @param contentType - The content type string
 * @returns True if the content type indicates binary data
 */
export function isBinaryResponse(contentType: string): boolean {
	const textContentTypes = [
		/application\/json/,
		/application\/xml/,
		/application\/xhtml\+xml/,
		/application\/atom\+xml/,
		/application\/rss\+xml/,
		/application\/rdf\+xml/,
		/application\/ld\+json/,
		/application\/pdf/,
		/application\/ld\+json/,
		/^text\//,
	];

	return !textContentTypes.some((regex) => regex.test(contentType));
}

/**
 * Processes binary data in the response
 * @param items - The node execution data items
 * @param response - The HTTP response
 * @returns The processed node execution data items
 */
export const processBinaryResponseData: PostReceiveAction =
	async function processBinaryResponseData(
		this: IExecuteSingleFunctions,
		items: INodeExecutionData[],
		response: IN8nHttpFullResponse,
	): Promise<INodeExecutionData[]> {
		const contentType = getResponseContentType(response);
		const isBinary = isBinaryResponse(contentType);

		const { binary } = items[0];

		if (isBinary && binary && binary.data && binary.data.mimeType === 'text/plain') {
			const data = binary.data as IBinaryData;

			// Convert response body base64 to binary
			// @ts-ignore
			data.data = Buffer.from(response.body as string, 'binary');

			data.mimeType = contentType;
			data.fileType = getFileTypeFromContentType(contentType) as BinaryFileType;
			data.fileExtension = getFileExtensionFromContentType(contentType);
		}

		if (binary && binary.data && !binary.data.fileName) {
			binary.data.fileName = `data.${getFileExtensionFromContentType(contentType)}`;
		}

		return items;
	};
