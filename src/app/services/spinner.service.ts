import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SpinnerService {

    public spinner: boolean = false;

    constructor() { }

    showSpinner() {
        setTimeout(() => {
            this.spinner = true;
        }, 1);

    }

    hideSpinner() {
        setTimeout(() => {
            this.spinner = false;
        }, 1);
    }
}
