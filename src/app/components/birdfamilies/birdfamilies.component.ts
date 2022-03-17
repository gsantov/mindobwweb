import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataApiService } from '../../services/data-api.service';
import { Router } from '@angular/router';
import { FamilyModel } from '../../models/family/family';
import { BirdfamiliesService } from './service/birdfamilies.service';
import { NavigationService } from '../../services/navigation.service';
import { LanguageService } from '../../services/language.service';
import { SpinnerService } from '../../services/spinner.service';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-birdfamilies',
    templateUrl: './birdfamilies.component.html',
    styleUrls: ['./birdfamilies.component.css']
})
export class BirdfamiliesComponent implements OnInit, OnDestroy {

    public allFilteredFamilies: Observable<FamilyModel[]>;
    public allFamiliesFilter: FormControl = new FormControl('');

    constructor(private dataApi: DataApiService, private router: Router, public familiesService: BirdfamiliesService,
        private navigationService: NavigationService, public languageService: LanguageService, public spinnerService: SpinnerService) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.navigationService.activateSection(3);
        this.dataApi.getAllFamilies().subscribe(families => {
            this.familiesService.allFamilies = families;
            this.spinnerService.hideSpinner();
            this.initSearch();
        })
    }

    ngOnDestroy(){
        this.allFamiliesFilter.setValue('');
    }

    search(text: string): FamilyModel[] {
		return this.familiesService.allFamilies.filter(family => this.languageService.getInfoByLanguage(family, 'name').toLowerCase().includes(text.toLowerCase())
            || family.scientificName.toLowerCase().includes(text.toLowerCase()));
    }
    
    initSearch() {
		this.allFilteredFamilies = this.allFamiliesFilter.valueChanges.pipe(
			startWith(''),
			map(text => this.search(text))
		);
	}

}
