import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../services/data-api.service';
import { HotspotModel } from '../../../models/hostspot/hotspot';
import { Constants } from '../../constants';
import { AngularFireStorage } from '@angular/fire/storage';
import { BirdModel } from '../../../models/bird/bird';
import { HotspotService } from '../services/hotspot.service';
import { Observable, Subscription } from 'rxjs';
import { finalize, startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ImageProcessingService } from '../../birdfamilies/bird-species/images/imageProcessingService';
import { PreviewModalService } from '../../preview-modal/preview-modal.service';
import { NgForm } from '@angular/forms';
import { LanguageService } from '../../../services/language.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
	selector: 'app-edit-hotspot',
	templateUrl: './edit-hotspot.component.html',
	styleUrls: ['./edit-hotspot.component.css']
})
export class EditHotspotComponent implements OnInit, OnDestroy {

	public sectionTitle: string;
	private file: File;
	private filePath: string;
	public imageName: string;
	public isNew: boolean;
	public imagePreviewButton: HTMLElement;
	public customFileContainer: HTMLElement;
	public uploadPercent: Observable<number>;
	public urlImage: Observable<string>;
	public submit: boolean;
	public fileLoaded: boolean;
	public verifyRepeatedSubscription: Subscription;

	constructor(private route: ActivatedRoute, private dataApi: DataApiService,
		private storage: AngularFireStorage, public hotspotService: HotspotService,
		private router: Router, private toastr: ToastrService, private imageService: ImageProcessingService,
		private previewModalService: PreviewModalService, public languageService: LanguageService, public spinnerService: SpinnerService) { }

	ngOnInit() {
		this.spinnerService.showSpinner();
		this.submit = false;
		this.fileLoaded = false;
		this.imagePreviewButton = document.getElementById("preview-image-btn") as HTMLElement;
		this.customFileContainer = document.getElementById("custom-file-inline-container") as HTMLElement;
		this.hotspotService.currentBirdCol = new Array();
		let hotspotId = this.route.snapshot.params['id'];
		if (hotspotId == 0) {
			this.imagePreviewButton.style.display = 'none';
			this.customFileContainer.style.width = '100%';
			this.isNew = true;
			this.sectionTitle = 'Nuevo';
			this.imageName = this.languageService.content.BROWSE;
			this.hotspotService.currentHotspot = new HotspotModel();
			this.loadData(false);
		} else {
			this.isNew = false;
			this.sectionTitle = this.languageService.content.EDIT_LABEL;
			this.dataApi.getHotspotById(hotspotId).subscribe(hotspot => {
				this.imagePreviewButton.style.display = 'inline-block';
				this.customFileContainer.style.width = 'calc(100% - 43px)';
				this.imageName = `${hotspot.imageName}.${hotspot.ext}`;
				this.hotspotService.currentHotspot = hotspot;
				this.loadData(true);
			});
		}
	}

	loadData(loadCurrentBirds: boolean) {
		this.dataApi.getAllFamilies().subscribe(families => {
			this.hotspotService.allFamilies = families;
			this.dataApi.getAllBirds().subscribe(birds => {
				this.hotspotService.allBirds = birds;
				this.hotspotService.allBirds.forEach(elem => {
					let currBird: BirdModel = this.hotspotService.allFamilies.find(family => family.id == elem.familyId);
					elem.familyName = this.languageService.getInfoByLanguage(currBird, 'name');
				})
				if (loadCurrentBirds) {
					this.hotspotService.currentHotspot.birdColRef.forEach(elem =>
						this.hotspotService.currentBirdCol.push(
							this.hotspotService.allBirds.find(bird => bird.id == elem)
						)
					)
				}
				// Inicializo para busqueda en modal add
				this.hotspotService.filteredBirds = this.hotspotService.filter.valueChanges.pipe(
					startWith(''),
					map(text => this.search(text))
				);
				this.spinnerService.hideSpinner();
			});
		})
	}

	search(text: string): BirdModel[] {
		return this.hotspotService.allBirds.filter(bird => 
			bird.familyName.toLowerCase().includes(text.toLowerCase())
				|| this.languageService.getInfoByLanguage(bird, 'name').toLowerCase().includes(text.toLowerCase()));
	}

	onUpload(e) {
		this.file = e.target.files[0];
		this.imageName = this.file.name;
		this.imageService.compress(this.file).subscribe(thumbnailFile => {
			this.file = thumbnailFile;
			if (this.hotspotService.currentHotspot.imageName == null) {
				// Creo nombre
				const id = Math.random().toString(36).substring(2);
				this.hotspotService.currentHotspot.imageName = `hotspot_${id}`;
				this.hotspotService.currentHotspot.ext = this.file.type.split('/')[1];
			}
			this.filePath = `${Constants.HOTSPOT_FOLDER_NAME}/${this.hotspotService.currentHotspot.imageName}.${this.hotspotService.currentHotspot.ext}`;
			this.imagePreviewButton.style.display = 'inline-block';
			this.customFileContainer.style.width = 'calc(100% - 43px)';
			this.fileLoaded = true;
		});
	}

	deleteBird(id: string, index: number) {
		let foundIndex = this.hotspotService.currentHotspot.birdColRef.findIndex(elem => elem  === id);
		this.hotspotService.currentHotspot.birdColRef.splice(foundIndex, 1);
		this.hotspotService.currentBirdCol.splice(index, 1);
	}

	saveToDb(form: NgForm) {
		this.submit = true;
		this.fileLoaded = this.file != undefined || this.hotspotService.currentHotspot.imageName != undefined;
		if (form.valid && this.fileLoaded) {
			this.spinnerService.showSpinner();
			if (this.isNew) {
				this.verifyRepeatedSubscription = this.verifyValidLocation().subscribe(repeatedHostpotCol => {
					this.verifyRepeatedSubscription.unsubscribe();
					if (repeatedHostpotCol.length == 0) {
						this.dataApi.addHotspot(this.hotspotService.currentHotspot);
						this.saveFile();
					} else {
						this.spinnerService.hideSpinner();
						this.toastr.error(this.languageService.content.LOCATION_ALREADY_EXISTS);
					}
				});
			} else {
				this.dataApi.updateHotspot(this.hotspotService.currentHotspot);
				this.saveFile();
			}
		} else {
			this.toastr.error(this.languageService.content.PLEASE_FILL_REQUIRED);
		}
	}

	saveFile() {
		// Compruebo si se ha cambiado
		if (this.filePath != undefined && this.file != undefined) {
			const ref = this.storage.ref(this.filePath);
			// Compruebo si existe un archivo para este hotspot
			this.createFileInDb().subscribe();
		} else {
			this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
			this.goBack();
		}
	}

	verifyValidLocation() {
		return this.dataApi.getHotspotByLocation(this.hotspotService.currentHotspot.location.latitude,
			this.hotspotService.currentHotspot.location.longitude);
	}

	createFileInDb() {
		// Si no encuentra el archivo crea uno nuevo
		const task = this.storage.upload(this.filePath, this.file);
		this.uploadPercent = task.percentageChanges();
		// Cuando acaba de cargar se llama a goBack
		return task.snapshotChanges().pipe(finalize(() => {
			this.goBack();
			this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
		}));
	}

	goBack() {
		this.router.navigate(['hostpots']);
	}

	previewImage() {
		this.previewModalService.setPreviewImage(this.file, Constants.HOTSPOT_FOLDER_NAME,
			this.hotspotService.currentHotspot.imageName, this.hotspotService.currentHotspot.ext);
	}

	ngOnDestroy() {
		this.previewModalService.preview = null;
	}

	clearSearch(){
		this.hotspotService.filter.setValue('');
	}

}
