import { ModuleWithProviders, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StringMaskDirective } from './directives/string-mask.directive';
import {
  IStringMaskMessages
} from './models/string-mask-messages.model';
import { StringMask } from './models/string-mask.model';
import { StringMaskPipe } from './pipes/string-mask.pipe';

@NgModule({
    declarations: [StringMaskDirective, StringMaskPipe],
    exports: [StringMaskDirective, StringMaskPipe],
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: StringMaskDirective,
        multi: true
    }
    ]
})
export class NgxInputStringMaskModule {
    static forRoot(
        masks: StringMask[],
        translations?: Partial<IStringMaskMessages>
    ): ModuleWithProviders<NgxInputStringMaskModule> {
        return {
            ngModule: NgxInputStringMaskModule,
            providers: [
                { provide: 'STRING_MASKS', useValue: masks },
                ...(translations
                    ? [
                          {
                              provide: "STRING_MASK_TRANSLATIONS",
                              useValue: translations,
                          },
                      ]
                    : []),
            ],
        };
    }
}
