import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, HostListener, Input, NgZone, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'jaspero-color-picker',
    templateUrl: './color-picker.html',
    styleUrls: ['./color-picker.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ColorPickerComponent),
        multi: true,
    }],
})
export class ColorPickerComponent implements AfterViewInit, ControlValueAccessor {

    // Value accessors
    onChange: Function;
    onTouched: Function;

    @ViewChild('bar') barEl: ElementRef;
    @ViewChild('sat') satEl: ElementRef;
    @ViewChild('input') inputEl: ElementRef;

    hexPattern = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

    extraColorsInner: string[] = [];
    color = [0, 100, 50];

    barHeight = 200;
    barClicked = false;
    barPickerTopPosition = 0;

    satWidth = 200;
    satHeight = 200;
    satCliked = false;
    satPickerTopPosition: string;
    satPickerLeftPosition: string;

    constructor(
        private _ngZone: NgZone,
        private _cdr: ChangeDetectorRef
    ) {}

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        if (this.barClicked) {
            this.setBarPickerValue(event);
        } else if (this.satCliked) {
            this.setSatPickerValue(event);
        }
    }

    @HostListener('mouseup', ['$event']) onMouseUp(event: MouseEvent) {
        if (this.barClicked || this.satCliked) {
            this.barClicked = false;
            this.satCliked = false;
        }
    }
    // TODO: Add logic for formating color types
    @Input() set extraColors(colors: string[]) {
        const final: string[] = [];
        colors.forEach(color => {
            const col = this._validHex(color);
            if (col) {
                final.push(col);
            }
        });

        this.extraColorsInner = final;
    };

    get barPickerStyle() {
        const toReturn: any = {
            background: this.hslBackgroundColor
        };

        if (this.barPickerTopPosition) {
            toReturn.top = `${this.barPickerTopPosition}%`;
        }

        return toReturn;
    }

    get satPickerStyle() {
        const toReturn: any = {
            background: this.hslFullColor
        };

        if (this.satPickerTopPosition) {
            toReturn.top = this.satPickerTopPosition;
        }

        if (this.satPickerLeftPosition) {
            toReturn.left = this.satPickerLeftPosition;
        }

        return toReturn;
    }

    get hslBackgroundColor() {
        return `hsl(${this.color[0]}, 100%, 50%)`;
    }

    get hslFullColor() {
        return `hsl(${this.color[0]}, ${this.color[1]}%, ${this.color[2]}%)`;
    }

    get hexColor() {
        const rgbColor = this._hslToRgb(this.color[0], this.color[1], this.color[2]);
        return Math.floor(((1 << 24) + (rgbColor[0] << 16) + (rgbColor[1] << 8) + rgbColor[2])).toString(16).slice(1).toUpperCase();
    }

    ngAfterViewInit() {
        this.inputEl.nativeElement.value = this.hexColor;
        this._registerInputListener();
    }

    barClick(event: MouseEvent) {
        this.barClicked = true;
        this.setBarPickerValue(event);
    }

    satClick(event: MouseEvent) {
        this.satCliked = true;
        this.setSatPickerValue(event);
    }

    setBarPickerValue(event: MouseEvent) {
        const barPosition = this._offset(this.barEl.nativeElement).top;

        this.barPickerTopPosition = this._segmentNumber(((event.pageY - barPosition) / this.barHeight) * 100, 0, this.barHeight / 2);
        this.color[0] = this._segmentNumber(Math.floor((((event.pageY - barPosition) / this.barHeight) * 360)), 0, 360);
        this.inputEl.nativeElement.value = this.hexColor;
        this.onChange('#' + this.inputEl.nativeElement.value);
    }

    setSatPickerValue(event: MouseEvent) {
        const satPosition = this._offset(this.satEl.nativeElement);
        const leftPosition = this._segmentNumber(event.pageX - satPosition.left, 0, this.satWidth);

        this.satPickerLeftPosition = leftPosition + 'px';
        this.satPickerTopPosition = this._segmentNumber(event.pageY - satPosition.top, 0, this.satHeight) + 'px';

        this.color[1] = Math.floor((leftPosition / this.satWidth) * 100);

        let x = event.pageX - satPosition.left;
        let y = event.pageY - satPosition.top;

        if (x > this.satWidth) {
            x = this.satWidth;
        } else if (x < 0) {
            x = 0;
        }

        if (y > this.satHeight) {
            y = this.satHeight;
        } else if (y < 0) {
            y = 0;
        }

        // convert between hsv and hsl
        const xRatio = x / this.satWidth * 100;
        const yRatio = y / this.satHeight * 100;
        const hsvValue = 1 - (yRatio / 100);
        const hsvSaturation = xRatio / 100;
        const lightness = (hsvValue / 2) * (2 - hsvSaturation);

        this.color[2] = Math.floor(lightness * 100);
        this.inputEl.nativeElement.value = this.hexColor;
        this.onChange('#' + this.inputEl.nativeElement.value);
    }

    hexChange(color: string, change = true) {
        const result = this.hexPattern.exec(color);
        if (result) {
            this.inputEl.nativeElement.value = color;
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);

            const hsl = this._rgbToHsl(r, g, b);
            const hsv = this._rgbToHsv(r, g, b);

            this.barPickerTopPosition = hsl[0] / 360 * 100;
            this.satPickerLeftPosition = hsl[1] + '%';
            this.satPickerTopPosition = 100 - ( hsv[2] * 100 ) + '%';

            this.color[0] = hsl[0];
            this.color[1] = hsl[1];
            this.color[2] = hsl[2];

            if (change) {
                this.onChange('#' + this.inputEl.nativeElement.value);
            }

            this._cdr.detectChanges();
        }
    }

    private _registerInputListener() {
        this._ngZone.runOutsideAngular(() => {
            Observable.fromEvent(this.inputEl.nativeElement, 'input')
                .debounceTime(300)
                .subscribe(_ => {
                    this.inputEl.nativeElement.value = this.inputEl.nativeElement.value.toUpperCase();
                    if (this.inputEl.nativeElement.value.length > 6) {
                        this.inputEl.nativeElement.value = this.inputEl.nativeElement.value.slice(0, 6);
                        this.hexChange(this.inputEl.nativeElement.value);
                    } else if (this.inputEl.nativeElement.value.length === 6) {
                        this.hexChange(this.inputEl.nativeElement.value);
                    }
                });
        });
    }

    // TODO: Add logic for formating color types
    writeValue(value: any ) {
        const val = this._validHex(value);
        if (val) {
            this.hexChange(val, false);
        }
    }

    registerOnChange(fn: any ) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any ) {
        this.onTouched = fn;
    }

    // Helpers
    private _isWindow(obj: any) {
        return obj !== null && obj === obj.window;
    }

    private _getWindow(element: any) {
        return this._isWindow(element) ? element : element.nodeType === 9 && element.defaultView;
    }

    private _offset(element: any) {

        const doc = element && element.ownerDocument;
        const docElem = doc.documentElement;
        const win = this._getWindow(doc);

        let box = {
            top: 0,
            left: 0
        };

        if (typeof element.getBoundingClientRect !== typeof undefined) {
            box = element.getBoundingClientRect();
        }

        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    // Color Helpers
    private _validHex(color: any) {
        if (typeof color !== 'string') {
            return;
        }

        if (color[0] === '#') {
            color = color.slice(1);
        }

        if (this.hexPattern.test(color)) {
            return color.toUpperCase();
        }

        return;
    }

    private _segmentNumber(num: number, min: number, max: number) {
        return Math.max(min, Math.min(num, max));
    }

    private _isPercentage(n: any) {
        return typeof n === 'string' && n.indexOf('%') !== -1;
    }

    private _isOnePointZero(n: any) {
        return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
    }

    private _bound01(n: any, max: any) {
        if (this._isOnePointZero(n)) {
            n = '100%';
        }

        const processPercent = this._isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = (n * max) / 100;
        }

        // Handle floating point rounding errors
        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    private _hslToRgb(h: number, s: number, l: number) {
        let r, g, b;

        h = this._bound01(h, 360);
        s = this._bound01(s, 100);
        l = this._bound01(l, 100);

        function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) {
                t += 1;
            } else if (t > 1) {
                t -= 1;
            } else if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            } else if (t < 1 / 2) {
                return q;
            } else if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [r * 255, g * 255, b * 255];
    }

    private _rgbToHsv(r: number, g: number, b: number) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        const s = (max === 0 ? 0 : d / max);
        const v = max / 255;

        let h;

        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2; h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4; h /= 6 * d;
                break;
        }

        return [h, s, v];
    }

    private _rgbToHsl(r: number, g: number, b: number) {
        r = r / 255;
        g = g / 255;
        b = b / 255;

        const maxColor = Math.max(r, g, b);
        const minColor = Math.min(r, g, b);
        // Calculate L:
        let L = (maxColor + minColor) / 2 ;
        let S = 0;
        let H = 0;

        if (maxColor !== minColor) {
            // Calculate S:
            if (L < 0.5) {
                S = (maxColor - minColor) / (maxColor + minColor);
            } else {
                S = (maxColor - minColor) / (2.0 - maxColor - minColor);
            }
            // Calculate H:
            if (r === maxColor) {
                H = (g - b) / (maxColor - minColor);
            } else if (g === maxColor) {
                H = 2.0 + (b - r) / (maxColor - minColor);
            } else {
                H = 4.0 + (r - g) / (maxColor - minColor);
            }
        }

        L = L * 100;
        S = S * 100;
        H = H * 60;

        if (H < 0) {
            H += 360;
        }

        return [H, S, L];
    }
}