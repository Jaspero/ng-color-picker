import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {ReactiveFormsModule} from '@angular/forms';
import {JasperoColorPickerModule} from '../color-picker/color-picker.module';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		ReactiveFormsModule,
		JasperoColorPickerModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
