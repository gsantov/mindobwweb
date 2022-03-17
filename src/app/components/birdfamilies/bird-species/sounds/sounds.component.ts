import { Component, OnInit } from '@angular/core';
import { UploadingState } from '../../../../models/bird/uploadingState';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../../services/data-api.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { BirdfamiliesService } from '../../service/birdfamilies.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Constants } from '../../../constants';
import { FirebaseSoundInfo } from '../../../../models/bird/firebaseSoundInfo';
import { finalize } from 'rxjs/operators';
import { LanguageService } from '../../../../services/language.service';
import { SpinnerService } from '../../../../services/spinner.service';

@Component({
    selector: 'app-sounds',
    templateUrl: './sounds.component.html',
    styleUrls: ['./sounds.component.css', '../multimedia.css']
})
export class SoundsComponent implements OnInit {

    private familyId;
    private birdId;
    public authorInfo: string;
    public newFile: File;
    public newFileName: string;
    public newExt: string;
    public newFilePath: string;
    private cerrarBtn: HTMLElement;
    private galleryContainer: HTMLElement;
    public fileLoaded: boolean;
    public clipName: string;
    public uploadPercent: UploadingState[];
    public soundCol: FirebaseSoundInfo[];
    private loadBirdSusbcription: Subscription;

    constructor(private route: ActivatedRoute, private dataApi: DataApiService,
        private storage: AngularFireStorage, public familiesService: BirdfamiliesService,
        private router: Router, private toastr: ToastrService, private modalService: NgbModal, 
        public languageService:LanguageService, public spinnerService: SpinnerService) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.fileLoaded = false;
        this.uploadPercent = new Array();
        this.clipName = this.languageService.content.BROWSE;
        this.authorInfo = null;
        this.familyId = this.route.snapshot.params['id'];
        this.birdId = this.route.snapshot.params['bid'];
        this.soundCol = new Array();
        this.loadBirdSusbcription = this.dataApi.getBirdByBirdId(this.birdId).subscribe(bird => {
            this.familiesService.currentBird = bird;
            if (this.familiesService.currentBird.soundGallery == undefined) {
                this.familiesService.currentBird.soundGallery = new Array();
            }
            this.loadSounds();
            this.loadBirdSusbcription.unsubscribe();
            this.cerrarBtn = document.getElementById("uploading-vid-progress") as HTMLElement;
            this.galleryContainer = document.getElementById("gallery-container") as HTMLElement;
        });
    }

    loadSounds() {
        if(this.familiesService.currentBird.soundGallery.length == 0){
            this.spinnerService.hideSpinner();
        } else {
            this.familiesService.currentBird.soundGallery.forEach(elem => {
                let filePath = `${Constants.SOUNDS_FOLDER_NAME}/${elem.clipName}.${elem.ext}`;
                this.loadUrl(filePath, elem.clipName, elem.ext);
            })
        }
    }

    loadUrl(filePath: string, clipName: string, ext: string) {
        this.storage.ref(filePath).getDownloadURL().subscribe(clipUrl => {
            let mediaInfo = new FirebaseSoundInfo();
            mediaInfo.filepath = filePath;
            mediaInfo.url = clipUrl;
            mediaInfo.ext = ext;
            mediaInfo.clipName = clipName;
            this.soundCol.push(mediaInfo);
            if(this.soundCol.length == this.familiesService.currentBird.soundGallery.length){
                this.spinnerService.hideSpinner();
            }
        });
    }

    addNewSound(uploadSoundModal) {
        this.modalService.open(uploadSoundModal).result.then((result) => {
            //Notificar
            if (result == 'Save') {
                // Actualizar info
                this.familiesService.currentBird.soundGallery.push({
                    'clipName': this.newFileName,
                    'ext': this.newExt,
                    'authorInfo': this.authorInfo
                });
                this.dataApi.updateBird(this.familiesService.currentBird);
                // Crear archivo
                let mediaInfo = new FirebaseSoundInfo();
                mediaInfo.filepath = this.newFilePath;
                mediaInfo.clipName = this.newFileName;
                mediaInfo.ext = this.newExt;
                this.createFileInDb(this.newFile, mediaInfo);
            } else {
                this.nulearCamposUpload();
            }
        }, (reason) => {
            this.nulearCamposUpload();
            // Cancel
        });
    }

    nulearCamposUpload() {
        this.clipName = this.languageService.content.BROWSE;
        this.newFile = null;
        this.newFileName = null;
        this.newExt = null;
        this.newFilePath = null;
        this.authorInfo = null;
    }

    createFileInDb(file: File, soundInfo: FirebaseSoundInfo) {
        // Si no encuentra el archivo crea uno nuevo
        this.storage.ref(soundInfo.filepath);
        const task = this.storage.upload(soundInfo.filepath, file);
        this.uploadPercent.push(
            new UploadingState(
                task.percentageChanges(),
                soundInfo.clipName
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
            this.storage.ref(soundInfo.filepath).getDownloadURL().subscribe(url => {
                soundInfo.url = url;
                this.soundCol.push(soundInfo);
                this.nulearCamposUpload();
                this.toastr.success(this.languageService.content.ADDED_SOUND_SUCCESFULLY);
            });
        })).subscribe();
    }

    onUpload(e) {
        this.newFile = e.target.files[0];
        this.clipName = this.newFile.name;
        // Creo nombre
        const id = Math.random().toString(36).substring(2);
        this.newFileName = `${this.familiesService.currentBird.esInfo.scientificName.replace(/\s/g, '')}_S_${id}`;
        this.newExt = this.newFile.type.split('/')[1];
        this.newFilePath = `${Constants.SOUNDS_FOLDER_NAME}/${this.newFileName}.${this.newExt}`;
        this.fileLoaded = true;
    }

    cerrarProgress() {
        this.familiesService.cerrarProgress(this.uploadPercent, this.cerrarBtn, this.galleryContainer);
    }

    deleteSound(selImage: FirebaseSoundInfo, index: number) {
        this.spinnerService.showSpinner();
        let foundIndex = this.familiesService.currentBird.soundGallery.findIndex(elem => elem.clipName == selImage.clipName);
        this.familiesService.currentBird.soundGallery.splice(foundIndex, 1);
        // Actualizo
        this.dataApi.updateBird(this.familiesService.currentBird);
        // TODO Confirmar eliminacion
        let ref = this.storage.ref(selImage.filepath);
        ref.delete().subscribe(() => {
            this.soundCol.splice(index, 1);
            // Cuando acaba de eliminar
            this.spinnerService.hideSpinner();
            this.toastr.success(this.languageService.content.SOUND_DELETED);
        })
    }

    goBack() {
		this.router.navigate(['birdFamilies/birds', this.familyId]);
	}
}
