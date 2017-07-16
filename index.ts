import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ColorPickerComponent} from './src/color-picker.component';

export * from './src/color-picker.component';

@NgModule({
	imports: [
		CommonModule
	],
	exports: [ColorPickerComponent],
	declarations: [ColorPickerComponent]
})
export class JasperoColorPickerModule  {}