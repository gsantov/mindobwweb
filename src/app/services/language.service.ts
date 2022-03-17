import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { esContent } from '../constants/esContent';
import { enContent } from '../constants/enContent';
import { LanguageModel } from '../models/language';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {

	public content;
	public availableLanguages: LanguageModel[] = [
		new LanguageModel('ES', 'Español'),
		new LanguageModel('EN', 'English')
	];

	constructor(private cookieService: CookieService) { }

	intiLanguageService() {
		if (this.cookieService.get('language') == '') {
			this.cookieService.set('language', 'ES');
		}
	}

	setLanguage(language) {
		this.cookieService.delete('language');
		this.cookieService.set('language', language);
		this.getLanguage();
	}

	getLanguage() {
		let language = this.cookieService.get('language');
		if (language == 'ES') {
			this.content = esContent;
		} else if (language == 'EN') {
			this.content = enContent;
		}
	}

	changeLanguage(language: number) {
		this.setLanguage(language);
		// setTimeout(() => {
			location.reload();
		// }, 100);
	}

	getInfoByLanguage(object:any, field:string) {
		if (this.content.CURRENT_LANGUAGE == 'ES') {
			return object['esInfo'][field];
		} else if (this.content.CURRENT_LANGUAGE == 'EN') {
			return object['enInfo'][field];
		}
	}
}
