import { Inject, Pipe, PipeTransform } from '@angular/core';
import { StringMask } from '../models/string-mask.model';
import { StringMaskHelper } from '../services/string-mask-helper';

/**
 * Pipe to transform a string value (e.g., serial number, activation code) from one notation to another.
 *
 * @param value Input string value to convert.
 * @param initialMaskName The applied mask notation name of the current value.
 * @param targetMaskName The targeted mask notation name we want to convert to.
 *
 * @returns The converted string value, or the original string value if the conversion failed.
 */
@Pipe({
    name: 'stringMask',
})
export class StringMaskPipe implements PipeTransform {
    private stringMaskHelper: StringMaskHelper;

    constructor(@Inject('STRING_MASKS') private masks: StringMask[]) {}

    transform(
        value: string,
        initialMaskName: string,
        targetMaskName: string
    ): string {
        this.stringMaskHelper = new StringMaskHelper(
            initialMaskName,
            this.masks
        );
        return this.stringMaskHelper.convertNotation(value, targetMaskName);
    }
}
