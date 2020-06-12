import { Response } from 'express';
import { ValidationError } from './validation-error';

const internalError = {
    success: false,
    error: 'Internal Error'
};

function endRequestWithJson(response: Response, data: object): void {
    try {
        const responseJson = JSON.stringify(data);
        response.end(responseJson);
    } catch (error) {
        console.error(error);

        const responseJson = JSON.stringify(internalError);
        response.end(responseJson);
    }
}

export function handleResponse(response: Response, data: any): void {
    let result: Record<string, any> = {};

    try {
        if (data instanceof Error) {
            console.error(data);
            throw data;
        } else {
            result.success = true;
            result.data = data;
            endRequestWithJson(response, result);
        }
    } catch (error) {
        result = { ...internalError };

        if (error instanceof ValidationError) {
            result.error = error.message;
        }

        endRequestWithJson(response, result);
    }
}
