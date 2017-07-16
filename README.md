[![Build Status](https://travis-ci.org/Jaspero/ng-color-picker.svg?branch=master)](https://travis-ci.org/jaspero/ng-color-picker)
[![NPM Version](https://img.shields.io/npm/v/@jaspero/ng-color-picker.svg)](https://www.npmjs.com/package/@jaspero/ng-color-picker)
# NG Color Picker
A simple color picker module with ReactiveForms capability, for Angular.

```
npm install --save @jaspero/ng-color-picker
```

## Setup
Import `JasperoColorPickerModule` in your `@NgModule`: 

```ts
@NgModule({
    imports: [
        JasperoColorPickerModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}
```