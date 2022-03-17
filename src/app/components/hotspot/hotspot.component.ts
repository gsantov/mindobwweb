import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataApiService } from '../../services/data-api.service';
import { HotspotModel } from '../../models/hostspot/hotspot';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { LanguageService } from '../../services/language.service';
import { SpinnerService } from '../../services/spinner.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-hotspot',
    templateUrl: './hotspot.component.html',
    styleUrls: ['./hotspot.component.css']
})
export class HotspotComponent implements OnInit, OnDestroy {

    public hotspotCol: HotspotModel[];

    public allFilteredHotspots: Observable<HotspotModel[]>;
    public allHotspotsFilter: FormControl = new FormControl('');

    constructor(private dataApi: DataApiService, private router: Router,
        private navigationService: NavigationService, public languageService: LanguageService,
        public spinnerService: SpinnerService, private toastr: ToastrService, private modalService: NgbModal) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.navigationService.activateSection(1);
        this.dataApi.getAllHotspots().subscribe(hotspots => {
            this.hotspotCol = hotspots;
            this.spinnerService.hideSpinner();
            this.initSearch();
        })
    }
    
    ngOnDestroy(){
        this.allHotspotsFilter.setValue('');
    }

    deleteHotspot(hotspot: HotspotModel, deleteHotspotModal) {
        this.verifyIfCanDelete(hotspot.id).then((canDelete) => {
            if (canDelete) {
                this.modalService.open(deleteHotspotModal, { centered: true }).result.then((result) => {
                    if (result == 'Delete') {
                        this.spinnerService.showSpinner();
                        this.dataApi.deleteHotspot(hotspot).then(() => {
                            this.spinnerService.hideSpinner();
                            this.toastr.success(this.languageService.content.HOTSPOT_DELETED_SUCCESFULLY);
                        });
                    }
                });
            } else {
                this.toastr.error(this.languageService.content.CANT_DELETE_HOTSPOT, '', { timeOut: 7000 })
            }
        });
    }

    verifyIfCanDelete(idToDelete: string): Promise<boolean> {
        let canDelete: boolean = true;
        return new Promise((resolve) => {
            this.spinnerService.showSpinner();
            let subscription: Subscription = this.dataApi.getAllTrails().subscribe(allTrails => {
                subscription.unsubscribe();
                if (allTrails == undefined || allTrails.length == 0) {
                    this.spinnerService.hideSpinner();
                    resolve(canDelete);
                }
                for (let index = 0; index < allTrails.length; index++) {
                    let foundHotspot: string = allTrails[index].poiColRef.find(hotspotId => hotspotId == idToDelete);
                    if (foundHotspot != undefined) {
                        canDelete = false;
                    }
                    if (index == (allTrails.length - 1)) {
                        this.spinnerService.hideSpinner();
                        resolve(canDelete);
                    }
                }
            })
        });
    }

    search(text: string): HotspotModel[] {
		return this.hotspotCol.filter(hotspot =>
			this.languageService.getInfoByLanguage(hotspot, 'title').toLowerCase().includes(text.toLowerCase()));
    }
    
    initSearch() {
		this.allFilteredHotspots = this.allHotspotsFilter.valueChanges.pipe(
			startWith(''),
			map(text => this.search(text))
		);
	}

}
