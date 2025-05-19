import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NgControl } from '@angular/forms';
import { IStringMaskMessages, StringMaskMessages } from '../models/string-mask-messages.model';
import { StringMask } from '../models/string-mask.model';
import { StringMaskHelper } from '../services/string-mask-helper';

/**
 * Directive to format, filter, and validate the text value of an input element.
 *
 * @example
 * ```html
 * <input appStringMask [maskName]="'SerialNumber'" [inputFormControl]="formControl">
 * ```
 */
@Directive({
  selector: 'input[appStringMask]',
})
export class StringMaskDirective implements OnInit, ControlValueAccessor {
  @Input() maskName: string;

  private stringMaskHelper: StringMaskHelper;
  private validationError: string | null;
  private onChange: (value: any) => void;
  private onTouched: () => void;
  private validationMessages: StringMaskMessages;

  constructor(
      private readonly el: ElementRef,
      @Inject('STRING_MASKS') private masks: StringMask[],
      @Inject('STRING_MASK_TRANSLATIONS') private translations: Partial<IStringMaskMessages>,
      @Optional() @Self() private ngControl: NgControl,
      @Optional() private controlContainer: ControlContainer
  ) {
      this.validationMessages = new StringMaskMessages(translations);
      if (this.ngControl) {
          this.ngControl.valueAccessor = this;
      }
  }

  ngOnInit() {
      this.stringMaskHelper = new StringMaskHelper(this.maskName, this.masks);
      this.el.nativeElement.classList.add('no-typing-caret');
  }

  writeValue(value: any): void {
      this.el.nativeElement.value = value || '';
  }

  registerOnChange(fn: any): void {
      this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
      this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
      this.el.nativeElement.disabled = isDisabled;
  }

  private get control(): AbstractControl {
      return this.ngControl ? this.ngControl.control : this.controlContainer.control.get(this.el.nativeElement.getAttribute('formControlName'));
  }

  private setError(text: string): void {
      this.validationError = text;
      this.control.setErrors({ stringMask: text });
  }

  private cleanError(): void {
      this.validationError = null;
      this.control.setErrors(null);
  }

  private publishError(): void {
      this.control.setErrors({ stringMask: this.validationError || '' });
  }

  @HostListener('focus', ['$event'])
  onInputFocus(): void {
      this.autocompleteMaskPrefix();
  }

  @HostListener('focusout', ['$event'])
  onInputUnfocus(): void {
      const inputValue = this.el.nativeElement.value;
      if (!this.stringMaskHelper.validate(inputValue)) {
          this.setError(this.validationMessages.invalidNotation);
          this.publishError();
      } else {
          this.cleanError();
      }
  }

  @HostListener('keypress', ['$event'])
  onInputKeypress(keyEvent: KeyboardEvent): void {
      const keyValue = keyEvent.key;
      const prevInputValue = this.el.nativeElement.value;
      const currInputValue = prevInputValue + this.stringMaskHelper.filter(keyValue);
      let finalInputValue = prevInputValue + this.stringMaskHelper.predictNextCharacter(prevInputValue) + this.stringMaskHelper.filter(keyValue);
      finalInputValue += this.stringMaskHelper.predictNextCharacter(finalInputValue);

      if (prevInputValue === currInputValue) {
          this.setError(this.validationMessages.unauthorizedChar);
          keyEvent.preventDefault();
          return;
      }
      if (finalInputValue.length > this.stringMaskHelper.appliedMask.notation.totalLength) {
          this.setError(this.validationMessages.maxSizeReached);
          keyEvent.preventDefault();
          return;
      }

      this.cleanError();
      keyEvent.preventDefault();
      this.el.nativeElement.value = finalInputValue;
      this.onChange(finalInputValue);
  }

  @HostListener('keydown', ['$event'])
  onInputKeydown(keyEvent: KeyboardEvent): void {
      const inputValue = this.el.nativeElement.value;

      if (!inputValue) {
          this.onInputFocus();
      }
      if (keyEvent.keyCode === 46 || keyEvent.keyCode === 8) {
          if (!this.isMaskPrefixEmpty() && this.isInputContainingOnlyPrefix(inputValue)) {
              this.setError(this.validationMessages.cannotDelete);
              keyEvent.preventDefault();
              return;
          } else {
              this.cleanError();
              keyEvent.preventDefault();
              this.el.nativeElement.value = inputValue.slice(0, -1);
              this.onChange(this.el.nativeElement.value);
          }
      }
  }

  @HostListener('keyup', ['$event'])
  onInputKeyup(keyEvent: KeyboardEvent): void {
      const inputValue = this.el.nativeElement.value;
      if (this.stringMaskHelper.validate(inputValue)) {
          this.publishError();
          setTimeout(() => this.cleanError(), 3000);
      } else {
          this.publishError();
      }
  }

  private autocompleteMaskPrefix(): void {
      if (!this.el.nativeElement.value) {
          this.el.nativeElement.value = this.stringMaskHelper.appliedMask.notation.prefix;
          this.onChange(this.el.nativeElement.value);
      }
  }

  private isInputContainingOnlyPrefix(inputValue: string) {
      return inputValue.length <= this.stringMaskHelper.appliedMask.notation.prefix.length;
  }

  private isMaskPrefixEmpty() {
      return this.stringMaskHelper.appliedMask.notation.prefix.length <= 0;
  }
}
