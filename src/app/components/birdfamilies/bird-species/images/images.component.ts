import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../../services/data-api.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { BirdfamiliesService } from '../../service/birdfamilies.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../constants';
import { finalize } from 'rxjs/operators';
import { FirebaseImageInfo } from '../../../../models/bird/firebaseImageInfo';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadingState } from '../../../../models/bird/uploadingState';
import { ImageProcessingService } from './imageProcessingService';
import { LanguageService } from '../../../../services/language.service';
import { SpinnerService } from '../../../../services/spinner.service';

@Component({
	selector: 'app-images',
	templateUrl: './images.component.html',
	styleUrls: ['./images.component.css', '../multimedia.css']
})
export class ImagesComponent implements OnInit {

	private familyId;
	private birdId;
	public imageName: string;

	public newFile: File;
	public thumbnailFile: File;
	public newFileName: string;
	public newExt: string;
	public newFilePath: string;
	public newThumbnailFileName: string;
	public newThumbnailExt: string;
	public newThumbnailPath: string;
	public uploadPercent: UploadingState[];

	private loadBirdSusbcription: Subscription;

	public imageCol: FirebaseImageInfo[];
	public authorInfo: string;

	private cerrarBtn: HTMLElement;
	private galleryContainer: HTMLElement;
	public fileLoaded:boolean;

	constructor(private route: ActivatedRoute, private dataApi: DataApiService,
		private storage: AngularFireStorage, public familiesService: BirdfamiliesService,
		private router: Router, private toastr: ToastrService, private modalService: NgbModal,
		private imageService: ImageProcessingService, public languageService:LanguageService, public spinnerService: SpinnerService) { }

	ngOnInit() {
		this.spinnerService.showSpinner();
		this.fileLoaded = false;
		this.uploadPercent = new Array();
		this.imageName = this.languageService.content.BROWSE;
		this.authorInfo = null;
		this.familiesService.previewType = null;
		this.imageCol = new Array();
		this.familyId = this.route.snapshot.params['id'];
		this.birdId = this.route.snapshot.params['bid'];
		this.loadBirdSusbcription = this.dataApi.getBirdByBirdId(this.birdId).subscribe(bird => {
			this.familiesService.currentBird = bird;
			if (this.familiesService.currentBird.imageGallery == undefined) {
				this.familiesService.currentBird.imageGallery = new Array();
			}
			this.loadImages();
			this.loadBirdSusbcription.unsubscribe();
			this.cerrarBtn = document.getElementById("uploading-vid-progress") as HTMLElement;
			this.galleryContainer = document.getElementById("gallery-container") as HTMLElement;
		});
	}

	previewImage(image:FirebaseImageInfo, content) {
		if (image.url == undefined) {
			this.spinnerService.showSpinner();
            this.storage.ref(image.filepath).getDownloadURL().subscribe(url => {
                image.url = url;
                this.familiesService.previewUrl = url;
				this.familiesService.previewType = `image/${image.ext}`;
				this.spinnerService.hideSpinner();
				this.openModal(content);
            });
        } else {
            this.familiesService.previewUrl = image.url;
			this.familiesService.previewType = `video/${image.ext}`;
			this.openModal(content);
        }
	}

	openModal(content){
		this.modalService.open(content, { size: 'lg', centered: true }).result.then((result) => {
            this.familiesService.previewUrl = null;
            this.familiesService.previewType = null;
        }, (reason) => {
            this.familiesService.previewUrl = null;
            this.familiesService.previewType = null;
        });
	}

	onUpload(e) {
		this.newFile = e.target.files[0];
		this.imageName = this.newFile.name;
		// Creo thumbnail
		this.imageService.compress(this.newFile).subscribe(thumbnailFile => {
			this.thumbnailFile = thumbnailFile;
			// Creo nombre
			const id = Math.random().toString(36).substring(2);
			this.newFileName = `${this.familiesService.currentBird.esInfo.scientificName.replace(/\s/g, '')}_I_${id}`;
			this.newExt = this.newFile.type.split('/')[1];
			this.newFilePath = `${Constants.BIRDS_FOLDER_NAME}/${this.newFileName}.${this.newExt}`;
			this.newThumbnailFileName = `${this.familiesService.currentBird.esInfo.scientificName.replace(/\s/g, '')}_IT_${id}`;
			this.newThumbnailExt = 'jpeg';
			this.newThumbnailPath = `${Constants.BIRDS_FOLDER_NAME}/${this.newThumbnailFileName}.${this.newThumbnailExt}`;
			this.fileLoaded = true;
		})
	}

	createFileInDb(file: File, thumbnailFile: File, imageInfo: FirebaseImageInfo) {
		// Si no encuentra el archivo crea uno nuevo
		this.storage.ref(imageInfo.filepath);
		const task = this.storage.upload(imageInfo.filepath, file);
		this.uploadPercent.push(
			new UploadingState(
				task.percentageChanges(),
				imageInfo.imageName
			)
		);
		let index = this.uploadPercent.length - 1;
		this.uploadPercent[index].uploadPercent.subscribe(res => {
			if (res == 100) {
				this.uploadPercent[index].finished = true;
			}
		})


		this.cerrarBtn.style.display = 'initial';
		this.galleryContainer.style.marginBottom = '75px';
		// Cuando acaba de cargar 
		task.snapshotChanges().pipe(finalize(() => {
			const thumbTask = this.storage.upload(imageInfo.thumbnailFilepath, thumbnailFile);
			thumbTask.snapshotChanges().pipe(finalize(() => {
				this.storage.ref(imageInfo.thumbnailFilepath).getDownloadURL().subscribe(url => {
					imageInfo.thumbnailUrl = url;
					this.imageCol.push(imageInfo);
					this.nulearCamposUpload();
					this.toastr.success(this.languageService.content.ADDED_IMAGE_SUCCESFULLY);
				});
			})).subscribe();
		})).subscribe();
	}

	nulearCamposUpload() {
		this.imageName = this.languageService.content.BROWSE;
		this.newFile = null;
		this.newFileName = null;
		this.newExt = null;
		this.newFilePath = null;
		this.authorInfo = null;
		this.newThumbnailFileName = null;
		this.newThumbnailExt = null;
		this.newThumbnailPath = null;
	}

	loadImages() {
		if(this.familiesService.currentBird.imageGallery.length == 0){
			this.spinnerService.hideSpinner();
		} else {
			this.familiesService.currentBird.imageGallery.forEach(elem => {
				let filePath = `${Constants.BIRDS_FOLDER_NAME}/${elem.imageName}.${elem.ext}`;
				let thumbnailPath = `${Constants.BIRDS_FOLDER_NAME}/${elem.thumbnail}.${elem.thumbnailExt}`;
				this.loadUrl(filePath, elem.imageName, elem.ext,
					thumbnailPath, elem.thumbnail, elem.thumbnailExt);
			})
		}
	}

	loadUrl(filePath: string, imageName: string, ext: string, thumbnailPath: string, thumbnailName: string, thumbnailExt: string) {
		this.storage.ref(thumbnailPath).getDownloadURL().subscribe(thumbnailUrl => {
			let mediaInfo = new FirebaseImageInfo();
			mediaInfo.filepath = filePath;
			mediaInfo.thumbnailUrl = thumbnailUrl;
			mediaInfo.imageName = imageName;
			mediaInfo.ext = ext;
			mediaInfo.thumbnailFilepath = thumbnailPath;
			mediaInfo.thumbnailName = thumbnailName;
			mediaInfo.thumbnailExt = thumbnailExt;
			this.imageCol.push(mediaInfo);
			if(this.imageCol.length == this.familiesService.currentBird.imageGallery.length){
				this.spinnerService.hideSpinner();
			}
		});
	}

	deleteImage(selImage: FirebaseImageInfo, index: number) {
		this.spinnerService.showSpinner();
		let foundIndex = this.familiesService.currentBird.imageGallery.findIndex(elem => elem.imageName == selImage.imageName);
		this.familiesService.currentBird.imageGallery.splice(foundIndex, 1);

		// Actualizo
		this.dataApi.updateBird(this.familiesService.currentBird);

		// TODO Confirmar eliminacion
		let ref = this.storage.ref(selImage.filepath);
		ref.delete().subscribe(() => {
			this.imageCol.splice(index, 1);
			// Cuando acaba de eliminar
			this.spinnerService.hideSpinner();
			this.toastr.success(this.languageService.content.IMAGE_DELETED);
		})
	}

	addNewImage(uploadImageModal) {
		this.modalService.open(uploadImageModal).result.then((result) => {
			//Notificar
			if (result == 'Save') {
				// Actualizar info
				this.familiesService.currentBird.imageGallery.push({
					'imageName': this.newFileName,
					'ext': this.newExt,
					'thumbnail': this.newThumbnailFileName,
					'thumbnailExt': this.newThumbnailExt,
					'authorInfo': this.authorInfo
				});
				this.dataApi.updateBird(this.familiesService.currentBird);
				// Crear archivo
				let mediaInfo = new FirebaseImageInfo();
				mediaInfo.filepath = this.newFilePath;
				mediaInfo.imageName = this.newFileName;
				mediaInfo.ext = this.newExt;
				mediaInfo.thumbnailFilepath = this.newThumbnailPath;
				mediaInfo.thumbnailName = this.newThumbnailFileName;
				mediaInfo.thumbnailExt = this.newThumbnailExt;
				this.createFileInDb(this.newFile, this.thumbnailFile, mediaInfo);
			} else {
				this.nulearCamposUpload();
			}
		}, (reason) => {
			this.nulearCamposUpload();
			// Cancel
		});
	}

	goBack() {
		this.router.navigate(['birdFamilies/birds', this.familyId]);
	}

	cerrarProgress() {
		this.familiesService.cerrarProgress(this.uploadPercent, this.cerrarBtn, this.galleryContainer);
	}

}
