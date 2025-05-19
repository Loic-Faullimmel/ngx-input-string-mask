import { Directive, ElementRef, HostListener, Inject, Input, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NgControl } from '@angular/forms';
import { IStringMaskMessages, StringMaskMessages } from '../models/string-mask-messages.model';
import { StringMask } from '../models/string-mask.model';
import { StringMaskHelper } from '../services/string-mask-helper';

@Directive({
  selector: 'input[appStringMask]',
})
export class StringMaskDirective implements OnInit, ControlValueAccessor {
  @Input() maskName: string;

  private maskHelper: StringMaskHelper;
  private error: string | null;
  private onChangeFn: (value: any) => void;
  private onTouchedFn: () => void;
  private messages: StringMaskMessages;

  private get control(): AbstractControl {
    return this.ngControl?.control || this.controlContainer?.control?.get(this.el.nativeElement.getAttribute('formControlName'));
  }

  constructor(
    private readonly el: ElementRef,
    @Inject('STRING_MASKS') private masks: StringMask[],
    @Inject('STRING_MASK_TRANSLATIONS') private translations: Partial<IStringMaskMessages>,
    @Optional() @Self() private ngControl: NgControl,
    @Optional() private controlContainer: ControlContainer
  ) {
    this.messages = new StringMaskMessages(translations);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.maskHelper = new StringMaskHelper(this.maskName, this.masks);
    this.el.nativeElement.classList.add('no-typing-caret');
  }

  // ControlValueAccessor methods

  writeValue(value: any): void {
    this.el.nativeElement.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  // HostListeners for input events

  @HostListener('focus')
  handleFocus(): void {
    if (!this.el.nativeElement.value) {
      this.autocompletePrefix();
    }
  }

  @HostListener('focusout')
  handleFocusOut(): void {
    const value = this.el.nativeElement.value;
    if (!this.maskHelper.validate(value)) {
      this.setError(this.messages.invalidNotation);
    } else {
      this.clearError();
    }
  }

  @HostListener('beforeinput', ['$event'])
  handleBeforeInput(event: InputEvent): void {
    const value = this.el.nativeElement.value;
    const newChar = event.data;

    if (this.isDeletion(event)) {
      this.removeChar(value);
      event.preventDefault();
      return;
    }

    if (newChar?.length === 1) {
      this.addChar(newChar, value);
      event.preventDefault();
      return;
    }

    if (this.isPaste(event)) {
      for (const char of newChar) {
        this.addChar(char, this.el.nativeElement.value);
      }
      event.preventDefault();
      this.handleFocusOut();
      return;
    }

    throw new Error(`[string-mask-input] Invalid input value: ${newChar}`);
  }

  @HostListener('select')
  handleSelect(): void {
    this.deselectInput();
  }

  // Private methods

  private deselectInput(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    input.selectionStart = input.selectionEnd;
  }

  private setError(message: string): void {
    this.error = message;
    this.control?.setErrors({ stringMask: message });
  }

  private clearError(): void {
    this.error = null;
    this.control?.setErrors(null);
  }

  private autocompletePrefix(): void {
    this.el.nativeElement.value = this.maskHelper.appliedMask.notation.prefix;
    this.onChangeFn(this.el.nativeElement.value);
  }

  private isPrefixOnly(value: string): boolean {
    return value.length <= this.maskHelper.appliedMask.notation.prefix.length;
  }

  private isPrefixEmpty(): boolean {
    return this.maskHelper.appliedMask.notation.prefix.length === 0;
  }

  private addChar(newChar: string, value: string): void {
    const filteredChar = this.maskHelper.filter(newChar);
    const nextValue = value + filteredChar;
    let finalValue = value + this.maskHelper.predictNextCharacter(value) + filteredChar;
    finalValue += this.maskHelper.predictNextCharacter(finalValue);

    if (value === nextValue) {
      this.setError(this.messages.unauthorizedChar);
      return;
    }

    if (finalValue.length > this.maskHelper.appliedMask.notation.totalLength) {
      this.setError(this.messages.maxSizeReached);
      return;
    }

    this.clearError();
    this.el.nativeElement.value = finalValue;
    this.onChangeFn(finalValue);
  }

  private removeChar(value: string): void {
    if (!this.isPrefixEmpty() && this.isPrefixOnly(value)) {
      this.setError(this.messages.cannotDelete);
    } else {
      this.clearError();
      this.el.nativeElement.value = value.slice(0, -1);
      this.onChangeFn(this.el.nativeElement.value);
      this.handleFocusOut();
    }
  }

  private isPaste(event: InputEvent): boolean {
    return (
      // For desktop devices
      event.inputType === 'insertFromPaste' ||
      event.inputType === 'insertFromDrop' ||
      event.inputType === 'insertFromCompositionStart' ||
      // For mobile devices
      (event.inputType === 'insertText' && event.data.length > 1)
    );
  }

  private isDeletion(event: InputEvent): boolean {
    return event.inputType.startsWith('delete');
  }
}
