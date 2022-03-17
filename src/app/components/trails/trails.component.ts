import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataApiService } from '../../services/data-api.service';
import { Router } from '@angular/router';
import { TrailModel } from '../../models/trail/trail';
import { NavigationService } from '../../services/navigation.service';
import { LanguageService } from '../../services/language.service';
import { SpinnerService } from '../../services/spinner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-trails',
    templateUrl: './trails.component.html',
    styleUrls: ['./trails.component.css']
})
export class TrailsComponent implements OnInit, OnDestroy {

    public trailCol:TrailModel[];
    public allFilteredRoutes: Observable<TrailModel[]>;
    public allRoutesFilter: FormControl = new FormControl('');

    constructor(private dataApi: DataApiService, private router: Router, 
        private navigationService:NavigationService, public languageService:LanguageService, public spinnerService: SpinnerService,
        private modalService: NgbModal, private toastr: ToastrService) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.navigationService.activateSection(2)
        this.dataApi.getAllTrails().subscribe(trails => {
            this.trailCol = trails;
            this.spinnerService.hideSpinner();
            this.initSearch();
        })
    }

    ngOnDestroy(){
        this.allRoutesFilter.setValue('');
    }

    deleteRoute(trail: TrailModel, deleteTrailModal) {
        this.modalService.open(deleteTrailModal, { centered: true }).result.then((result) => {
            if (result == 'Delete') {
                this.spinnerService.showSpinner();
                this.dataApi.deleteRoute(trail).then(() => {
                    this.spinnerService.hideSpinner();
                    this.toastr.success(this.languageService.content.ROUTE_DELETED_SUCCESFULLY);
                });
            }
        });
    }

    search(text: string): TrailModel[] {
		return this.trailCol.filter(trail =>
			this.languageService.getInfoByLanguage(trail, 'name').toLowerCase().includes(text.toLowerCase()));
    }
    
    initSearch() {
		this.allFilteredRoutes = this.allRoutesFilter.valueChanges.pipe(
			startWith(''),
			map(text => this.search(text))
		);
	}

}
