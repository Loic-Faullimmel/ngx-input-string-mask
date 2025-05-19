/**
 * Interface representing a string mask.
 *
 * @description Allows validation, input character filtering, and prediction of separators in a value notation.
 *
 * @example
 * Example usage for a serial number:
 * ```typescript
 * const serialNumberMask: StringMask = {
 *   name: "SerialNumber",
 *   inputFilterRegex: "[^0-9]+",
 *   notation: {
 *     prefix: "SN",
 *     totalLength: 15,
 *     separators: [
 *       { character: "-", position: 3 },
 *       { character: "-", position: 7 },
 *       { character: "-", position: 11 }
 *     ]
 *   }
 * };
 * ```
 *
 * **WARNING**: Notation cant have 2 separators next to each other:
    ``` TS
      {
        // ...
        notation: {
          // ...
          separators: [
              { character: "-", position: 9 },
              { character: "!", position: 10 }
          ]
        }
      }
    ```
  * Solution :
    ``` TS
      {
        // ...
        notation: {
          // ...
          separators: [
              { character: "-!", position: 9 }
          ]
        }
      }
    ```
 */
export interface StringMask {
  name: string;
  inputFilterRegex: string;
  notation: MaskNotation;
}

export interface MaskNotation {
  prefix: string;
  totalLength: number;
  separators: NotationSeparator[];
}

export interface NotationSeparator {
  character: string;
  position: number;
}
