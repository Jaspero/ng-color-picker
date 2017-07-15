import { Component } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';

	form: FormGroup;

	ngOnInit() {
		this.form = new FormGroup({
			color: new FormControl('#ffffff')
		})

		this.form.valueChanges
			.subscribe(res => console.log(res))
	}
}
