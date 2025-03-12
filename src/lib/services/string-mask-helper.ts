import { StringMask } from "../models/string-mask.model";

/**
 * Helper class for string mask logic.
 *
 * @description Contains implementations and methods to validate, filter, autocomplete, and predict a string input value.
 * Also able to convert a value from a mask notation to another one.
 */
export class StringMaskHelper {
  private availableMasks: StringMask[];
  public appliedMask: StringMask;

  constructor(maskName: string, masks: StringMask[]) {
      this.availableMasks = masks;
      const matchingMask = this.findAvailableMask(maskName, masks);
      if (matchingMask) {
        this.appliedMask = matchingMask;
      } else {
        throw new Error(`No string mask found with name ${maskName}`);
      }
  }

  private findAvailableMask(maskName: string, masks: StringMask[] = this.availableMasks): StringMask | undefined {
      return masks.find(mask => mask.name === maskName);
  }

  filter(value: string): string {
      let filteredValue = value.toUpperCase();
      filteredValue = filteredValue.replace(new RegExp(this.appliedMask.inputFilterRegex), '');
      return filteredValue;
  }

  validate(value: string): boolean {
      if (!value || value.length !== this.appliedMask.notation.totalLength) {
          return false;
      }
      if (!value.startsWith(this.appliedMask.notation.prefix)) {
          return false;
      }
      return this.validateNotation(value);
  }

  private validateNotation(value: string): boolean {
      return this.appliedMask.notation.separators.every(
          separator => value.charAt(separator.position - 1) === separator.character
      );
  }

  predictNextCharacter(value: string): string {
      for (const separator of this.appliedMask.notation.separators) {
          if (value.length === separator.position - 1) {
              return separator.character;
          }
      }
      return '';
  }

  convertNotation(value: string, targetMaskName: string): string {
      if (!this.validate(value)) {
          return value;
      }
      const targetMask = this.findAvailableMask(targetMaskName);
      if (!targetMask) {
        throw new Error(`String mask conversion failed: No string mask found with name ${targetMaskName}`);
      }
      value = this.removeSeparators(value, this.appliedMask);
      value = this.removePrefix(value, this.appliedMask);
      value = this.addPrefix(value, targetMask);
      value = this.insertSeparators(value, targetMask);
      return value;
  }

  private removePrefix(value: string, mask: StringMask): string {
      const prefix = mask.notation.prefix;
      if (prefix && value.startsWith(prefix)) {
          value = value.slice(prefix.length);
      }
      return value;
  }

  private addPrefix(value: string, mask: StringMask): string {
      return `${mask.notation.prefix}${value}`;
  }

  private removeSeparators(value: string, mask: StringMask): string {
      for (let index = 0; index < mask.notation.separators.length; index++) {
          const separator = mask.notation.separators[index];
          const separatorIndex = separator.position - 1 - index;
          if (value.length >= separatorIndex) {
              value = value.slice(0, separatorIndex) + value.slice(separatorIndex + 1);
          }
      }
      return value;
  }

  private insertSeparators(value: string, mask: StringMask): string {
      for (const separator of mask.notation.separators) {
          const separatorIndex = separator.position - 1;
          if (value.length >= separatorIndex) {
              value = value.slice(0, separatorIndex) + separator.character + value.slice(separatorIndex);
          }
      }
      return value;
  }
}
