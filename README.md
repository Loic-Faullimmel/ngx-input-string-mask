# ngx-input-string-mask

This library helps you format and validate input fields in Angular applications by applying string masks. For example, you can ensure a serial number input follows a specific pattern like 'SN-123-456-789'.

## Installation

Local library configured as an app project (cf. [`angular.json`](./../../angular.json)).

## Step-by-Step Guide

### 1. Define Your Masks

First, define the masks you will use in your application. A mask includes a name, a regex for filtering input, and a notation for formatting.

#### Example

```typescript
// Define your masks
const serialNumberMask: StringMask = {
    name: 'SerialNumber',
    inputFilterRegex: '[^0-9]+', // Only allow numbers
    notation: {
        prefix: 'SN',
        totalLength: 18, // Total length including prefix and separators
        separators: [
            // Separator positions with an index from 1 to 18
            { character: '-', position: 3 },
            { character: '-', position: 7 },
            { character: '-', position: 11 },
            { character: '-', position: 15 },
        ],
    },
};

const anotherMask: StringMask = {
    name: 'AnotherMask',
    inputFilterRegex: '[^A-Z]+', // Only allow uppercase letters
    notation: {
        prefix: 'AM',
        totalLength: 10, // Total length including prefix and separators
        separators: [
            // Separator positions with an index from 1 to 10
            { character: '.', position: 3 },
            { character: '.', position: 6 },
        ],
    },
};

// Example usage of serialNumberMask:
// Input: "SN123456789012"
// Output: "SN-123-456-789-012"

// Example usage of anotherMask:
// Input: "AMABCD"
// Output: "AM.AB.CD"
```

### 2. Configure the Module

Import and configure the `NgxInputStringMaskModule` in your Angular module. Provide the masks and translations.

#### Example

```typescript
import { NgxInputStringMaskModule } from 'ngx-input-string-mask';

@NgModule({
    imports: [
        NgxInputStringMaskModule.forRoot([serialNumberMask, anotherMask], {
            maxSizeReached: 'Maximum number of characters reached.',
            unauthorizedChar: 'Unauthorized character.',
            cannotDelete: 'Cannot be deleted.',
            invalidNotation: 'Invalid notation.',
        }),
    ],
})
export class AppModule {}
```

### 3. Use the Directive

Apply the `appStringMask` directive to your input elements. Bind the `maskName` to the directive. Additionally, handle error messages by displaying them below the input element.

#### Example

```html
<form>
    <input
        [formControl]="serialNumberControl"
        appStringMask
        [maskName]="'SerialNumber'"
    />
    <div *ngIf="serialNumberControl.errors?.stringMask">
        {{ serialNumberControl.errors.stringMask }}
    </div>
</form>
```

### Special Cases

#### Two Separators Next to Each Other

**Note:** Notation cannot have two separators next to each other. For example:

```typescript
{
    notation: {
        separators: [
            { character: '-', position: 9 },
            { character: '!', position: 10 },
        ];
    }
}
```

Solution:

```typescript
{
    notation: {
        separators: [{ character: '-!', position: 9 }];
    }
}
```

#### Providing Asynchronous Messages

You can provide asynchronous messages by leaving the second parameter of `forRoot` empty and adding the following in your `AppModule`:

```typescript
import { TranslateService } from '@ngx-translate/core';

@NgModule({
    imports: [
        NgxInputStringMaskModule.forRoot([serialNumberMask, anotherMask]),
    ],
    providers: [
        {
            provide: 'STRING_MASK_TRANSLATIONS',
            useFactory: (translateService: TranslateService) =>
                ({
                    maxSizeReached: translateService.get(
                        'Maximum number of characters reached.'
                    ),
                    cannotDelete: translateService.get(
                        'Cannot be deleted.'
                    ),
                    invalidNotation: translateService.get(
                        'Unvalid notation.'
                    ),
                    unauthorizedChar: translateService.get(
                        'Unauthorized character.'
                    ),
                } as Partial<IStringMaskMessages>),
            deps: [TranslateService],
        },
    ],
})
export class AppModule {}
```

## Bonus features

### Converting pipe

Transform string values from one notation to another using the `stringMask` pipe.

#### Example

```html
<p>{{ value | stringMask: 'SerialNumber' : 'AnotherMask' }}</p>
```

> PS: For conversion purposes, it is preferable for the masks to have the same length. Used, for example, when only the separators change.

### Helper class

The `StringMaskHelper` class provides additional methods for advanced usage, such as filtering, validating, and converting string values.

#### Example

```typescript
const masks: StringMask[] = [serialNumberMask, anotherMask];
const helper = new StringMaskHelper('SerialNumber', masks);

const filteredKeyValue = helper.filter('1'); // "1"
const filteredKeyValue = helper.filter(''); // ""
const nextChar = helper.predictNextCharacter('SN123'); // "-"
const isValid = helper.validate('SN123-456-789'); // true
const convertedValue = helper.convertNotation('SN123-456-789', 'AnotherMask'); // "AM.12.3456789"
```
