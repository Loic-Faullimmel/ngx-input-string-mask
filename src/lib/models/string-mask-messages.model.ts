import { isObservable, Observable } from 'rxjs';

/**
 * Lib messages.
 */
export interface IStringMaskMessages {
    maxSizeReached: string | Observable<string>;
    unauthorizedChar: string | Observable<string>;
    cannotDelete: string | Observable<string>;
    invalidNotation: string | Observable<string>;
}

export class StringMaskMessages implements IStringMaskMessages {
    constructor(options?: Partial<IStringMaskMessages>) {
        this.setMessage('maxSizeReached', options?.maxSizeReached);
        this.setMessage('unauthorizedChar', options?.unauthorizedChar);
        this.setMessage('cannotDelete', options?.cannotDelete);
        this.setMessage('invalidNotation', options?.invalidNotation);
    }

    // Default messages
    maxSizeReached: string = 'Maximum number of characters reached.';
    unauthorizedChar: string = 'Unauthorized character.';
    cannotDelete: string = 'Cannot be deleted.';
    invalidNotation: string = 'Invalid notation.';

    // Setter for sync or async input.
    private setMessage(
        key: keyof StringMaskMessages,
        value: string | Observable<string>
    ): void {
        if (isObservable(value)) {
            value.subscribe((translatedValue: string) => {
                this[key] = translatedValue;
            });
        } else if (value !== undefined) {
            this[key] = value;
        }
    }
}
