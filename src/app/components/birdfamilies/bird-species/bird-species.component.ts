import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../services/data-api.service';
import { BirdfamiliesService } from '../service/birdfamilies.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../../services/language.service';
import { BirdModel } from '../../../models/bird/bird';
import { startWith, map } from 'rxjs/operators';
import { NavigationService } from '../../../services/navigation.service';
import { SpinnerService } from '../../../services/spinner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-bird-species',
	templateUrl: './bird-species.component.html',
	styleUrls: ['./bird-species.component.css']
})
export class BirdSpeciesComponent implements OnInit, OnDestroy {

	public sectionTitle: string;
	private file: File;
	private filePath: string;
	public imageName: string;
	private isNew: boolean;
	public familyId;
	public familyName: string;
	public all: boolean;

	public allFilteredBirds: Observable<BirdModel[]>;
	public allBirdsFilter: FormControl = new FormControl('');

	constructor(private route: ActivatedRoute, private dataApi: DataApiService,
		private storage: AngularFireStorage, public familiesService: BirdfamiliesService,
		private router: Router, private toastr: ToastrService, public languageService: LanguageService,
		private navigationService: NavigationService, public spinnerService: SpinnerService, private modalService: NgbModal) { }


	ngOnInit() {
		this.familiesService.currentBirdCol = new Array();
		this.familyId = this.route.snapshot.params['id'];
		this.all = this.familyId == 'all';
		if (this.familyId == 'all') {
			this.navigationService.activateSection(4);
			this.spinnerService.showSpinner();
			// LOAD ALL BIRDS
			this.dataApi.getAllBirds().subscribe(allBirds => {
				this.familiesService.currentBirdCol = allBirds;
				this.initSearch();
				this.spinnerService.hideSpinner();
			});
		} else {
			// Obtengo nombre famlia
			this.spinnerService.showSpinner();
			this.dataApi.getFamilyById(this.familyId).subscribe(family => {
				this.imageName = `${family.imageName}.${family.ext}`;
				this.familiesService.currentFamily = family;
				if (this.familyId == 0) {
					this.isNew = true;
					this.sectionTitle = 'Nuevo';
					this.imageName = this.languageService.content.BROWSE;
					this.spinnerService.hideSpinner();
				} else {
					this.isNew = false;
					this.sectionTitle = this.languageService.content.EDIT_LABEL;
					this.dataApi.getAllBirdsFromFamily(this.familyId).subscribe(birds => {
						this.familiesService.currentBirdCol = birds;
						this.initSearch()
						this.spinnerService.hideSpinner();
					});
				}
			});
		}
		// Inicializo para busqueda en modal add
		this.allFilteredBirds = this.allBirdsFilter.valueChanges.pipe(
			startWith(''),
			map(text => this.search(text))
		);
	}

	ngOnDestroy() {
		this.allBirdsFilter.setValue('');
	}

	initSearch() {
		// Inicializo para busqueda en modal add
		this.allFilteredBirds = this.allBirdsFilter.valueChanges.pipe(
			startWith(''),
			map(text => this.search(text))
		);
	}

	goBack() {
		this.router.navigate(['birdFamilies']);
	}

	search(text: string): BirdModel[] {
		return this.familiesService.currentBirdCol.filter(bird =>
			this.languageService.getInfoByLanguage(bird, 'scientificName').toLowerCase().includes(text.toLowerCase())
			|| this.languageService.getInfoByLanguage(bird, 'name').toLowerCase().includes(text.toLowerCase()));
	}

	deleteBird(bird: BirdModel, deleteBirdModal) {
		this.verifyIfCanDelete(bird.id).then((canDelete) => {
			if (canDelete) {
				this.modalService.open(deleteBirdModal, { centered: true }).result.then((result) => {
					if (result == 'Delete') {
						this.spinnerService.showSpinner();
						this.dataApi.deleteBird(bird).then(() => {
							this.spinnerService.hideSpinner();
							this.toastr.success(this.languageService.content.BIRD_DELETED_SUCCESFULLY);
							this.allBirdsFilter.setValue('');
						});
					}
				});
			} else {
				this.toastr.error(this.languageService.content.CANT_DELETE_BIRD, '', { timeOut: 7000 })
			}
		});
	}

	verifyIfCanDelete(idToDelete: string): Promise<boolean> {
		let canDelete: boolean = true;
		return new Promise((resolve) => {
			this.spinnerService.showSpinner();
			let subscription: Subscription = this.dataApi.getAllHotspots().subscribe(allHotspots => {
				subscription.unsubscribe();
				if (allHotspots == undefined || allHotspots.length == 0) {
					this.spinnerService.hideSpinner();
					resolve(canDelete);
				}
				for (let index = 0; index < allHotspots.length; index++) {
					let foundBird: string = allHotspots[index].birdColRef.find(birdId => birdId == idToDelete);
					if (foundBird != undefined) {
						canDelete = false;
					}
					if (index == (allHotspots.length - 1)) {
						resolve(canDelete);
					}
				}
			})
		});
	}

}
