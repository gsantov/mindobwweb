import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../services/data-api.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { BirdfamiliesService } from '../service/birdfamilies.service';
import { FamilyModel } from '../../../models/family/family';
import { Constants } from '../../constants';
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ImageProcessingService } from '../bird-species/images/imageProcessingService';
import { PreviewModalService } from '../../preview-modal/preview-modal.service';
import { NgForm } from '@angular/forms';
import { LanguageService } from '../../../services/language.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
	selector: 'app-edit-families',
	templateUrl: './edit-families.component.html',
	styleUrls: ['./edit-families.component.css']
})
export class EditFamiliesComponent implements OnInit {

	public sectionTitle: string;
	private file: File;
	private filePath: string;
	public imageName: string;
	public isNew: boolean;
	public imagePreviewButton: HTMLElement;
	public customFileContainer: HTMLElement;
	public previewImg: File;
	public submit: boolean;
	public fileLoaded: boolean;
	public uploadPercent: Observable<number>;
	public verifyRepeatedSubscription: Subscription;

	constructor(private route: ActivatedRoute, private dataApi: DataApiService,
		private storage: AngularFireStorage, public familiesService: BirdfamiliesService,
		private router: Router, private toastr: ToastrService, private imageService: ImageProcessingService,
		private previewModalService: PreviewModalService, public languageService: LanguageService, public spinnerService: SpinnerService) { }

	ngOnInit() {
		this.spinnerService.showSpinner();
		this.submit = false;
		this.fileLoaded = false;
		this.imagePreviewButton = document.getElementById("preview-image-btn") as HTMLElement;
		this.customFileContainer = document.getElementById("custom-file-inline-container") as HTMLElement;
		let familyId = this.route.snapshot.params['id'];
		if (familyId == 0) {
			this.imagePreviewButton.style.display = 'none';
			this.customFileContainer.style.width = '100%';
			this.isNew = true;
			this.sectionTitle = 'Nuevo';
			this.imageName = this.languageService.content.BROWSE;
			this.familiesService.currentFamily = new FamilyModel();
			this.spinnerService.hideSpinner();
		} else {
			this.isNew = false;
			this.sectionTitle = this.languageService.content.EDIT_LABEL;
			this.dataApi.getFamilyById(familyId).subscribe(family => {
				this.imagePreviewButton.style.display = 'inline-block';
				this.customFileContainer.style.width = 'calc(100% - 43px)';
				this.imageName = `${family.imageName}.${family.ext}`;
				this.familiesService.currentFamily = family;
				this.spinnerService.hideSpinner();
			});
		}
	}

	onUpload(e) {
		this.file = e.target.files[0];
		this.imageName = this.file.name;
		this.imageService.compress(this.file).subscribe(thumbnailFile => {
			this.file = thumbnailFile;
			if (this.familiesService.currentFamily.imageName == null) {
				// Creo nombre
				const id = Math.random().toString(36).substring(2);
				this.familiesService.currentFamily.imageName = `family_${id}`;
				this.familiesService.currentFamily.ext = this.file.type.split('/')[1];
			}
			this.filePath = `${Constants.FAMILIES_FOLDER_NAME}/${this.familiesService.currentFamily.imageName}.${this.familiesService.currentFamily.ext}`;
			this.imagePreviewButton.style.display = 'inline-block';
			this.customFileContainer.style.width = 'calc(100% - 43px)';
			this.fileLoaded = true;
		});
	}

	saveToDb(form: NgForm) {
		this.submit = true;
		this.fileLoaded = this.file != undefined || this.familiesService.currentFamily.imageName != undefined;
		if (form.valid && this.fileLoaded) {
			this.spinnerService.showSpinner();
			if (this.isNew) {
				this.verifyRepeatedSubscription = this.dataApi.getFamiliesByScientificName(this.familiesService.currentFamily.scientificName)
					.subscribe(repeatedFamilies => {
						this.verifyRepeatedSubscription.unsubscribe();
						if (repeatedFamilies.length == 0) {
							this.dataApi.addFamily(this.familiesService.currentFamily);
							this.saveFile();
						} else {
							this.spinnerService.hideSpinner();
							this.toastr.error(this.languageService.content.FAMILY_ALREADY_REGISTERED);
						}
					})
			} else {
				this.dataApi.updateFamily(this.familiesService.currentFamily);
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
			this.spinnerService.hideSpinner();
			this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
			this.goBack();
		}
	}

	createFileInDb() {
		// Si no encuentra el archivo crea uno nuevo
		const task = this.storage.upload(this.filePath, this.file);
		this.uploadPercent = task.percentageChanges();
		// Cuando acaba de cargar se llama a goBack
		return task.snapshotChanges().pipe(finalize(() => {
			this.spinnerService.hideSpinner();
			this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
			this.goBack();
		}));
	}

	goBack() {
		this.router.navigate(['birdFamilies']);
	}

	previewImage() {
		this.previewModalService.setPreviewImage(this.file, Constants.FAMILIES_FOLDER_NAME,
			this.familiesService.currentFamily.imageName, this.familiesService.currentFamily.ext);
	}

}
