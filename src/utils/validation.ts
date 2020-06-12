import { ValidationError } from './validation-error';

export function checkIfProvided<T extends object>(data: T, fieldName: keyof T): void {
    const fieldData = data[fieldName];

    if (fieldData === undefined || fieldData === null) {
        throw new ValidationError(`Field '${fieldName}' is required for product creation`);
    }
}

export function checkIfValidNumber<T extends object, K extends keyof T>(data: T, fieldName: K): void {
    const fieldData = data[fieldName];

    if (typeof fieldData !== 'number' || isNaN(fieldData)) {
        throw new ValidationError(`Field '${fieldName}' has to be a valid number`);
    }
}
