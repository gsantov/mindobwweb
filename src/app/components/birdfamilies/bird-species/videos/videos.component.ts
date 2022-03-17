import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseVideoInfo } from '../../../../models/bird/firebaseVideoInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { BirdfamiliesService } from '../../service/birdfamilies.service';
import { ToastrService } from 'ngx-toastr';
import { DataApiService } from '../../../../services/data-api.service';
import { Constants } from '../../../constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { VideoProcessingService } from './videoProcessingService';
import { finalize } from 'rxjs/operators';
import { UploadingState } from '../../../../models/bird/uploadingState';
import { LanguageService } from '../../../../services/language.service';
import { SpinnerService } from '../../../../services/spinner.service';

@Component({
    selector: 'app-videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.css', '../multimedia.css']
})
export class VideosComponent implements OnInit {

    @ViewChild('previewModal') previewModal: ElementRef;

    private familyId;
    private birdId;
    public uploadPercent: UploadingState[];
    private loadBirdSusbcription: Subscription;
    public videoCol: FirebaseVideoInfo[];
    private cerrarBtn: HTMLElement;
    private galleryContainer: HTMLElement;
    public videoName: string;
    public authorInfo: string;
    public newThumbnailFilePath:string;

    public newVideoFileName:string;
    public newFile:File;
    public newThumbnailBlob:Blob;
    public newVideoExt:string;
    public newThumbnailFileName:string;
    public newThumbnailExt:string;
    public newVideoFilePath:string;
    public fileLoaded:boolean;

    constructor(private route: ActivatedRoute, private dataApi: DataApiService,
        private storage: AngularFireStorage, public familiesService: BirdfamiliesService,
        private router: Router, private toastr: ToastrService, private modalService: NgbModal,
        private videoService: VideoProcessingService, public languageService:LanguageService, public spinnerService: SpinnerService) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.fileLoaded = false;
        this.authorInfo = null;
        this.videoName = this.languageService.content.BROWSE;
        this.uploadPercent = new Array();
        this.familiesService.previewType = null;
        this.videoCol = new Array();
        this.familyId = this.route.snapshot.params['id'];
        this.birdId = this.route.snapshot.params['bid'];
        this.loadBirdSusbcription = this.dataApi.getBirdByBirdId(this.birdId).subscribe(bird => {
            this.familiesService.currentBird = bird;
            if (this.familiesService.currentBird.videoGallery) {
                this.familiesService.currentBird.videoGallery = new Array();
            }
            this.loadThumbnails();
            this.loadBirdSusbcription.unsubscribe();
            this.cerrarBtn = document.getElementById("uploading-vid-progress") as HTMLElement;
            this.galleryContainer = document.getElementById("gallery-container") as HTMLElement;
        });
    }

    loadThumbnails() {
        if(this.familiesService.currentBird.videoGallery.length == 0){
            this.spinnerService.hideSpinner();
        } else {
            this.familiesService.currentBird.videoGallery.forEach(elem => {
                let thumbnailPath = `${Constants.BIRDS_FOLDER_NAME}/${elem.thumbnail}.${elem.thumbnailExt}`;
                let videoPath = `${Constants.BIRDS_FOLDER_NAME}/${elem.videoName}.${elem.ext}`;
                this.loadUrl(thumbnailPath, elem.thumbnail, elem.thumbnailExt, videoPath, elem.videoName, elem.ext);
            })
        }
    }

    loadUrl(thumbnailPath: string, thumbnailName: string, thumbnailExt: string, videoPath: string, videoName: string, videoExt: string) {
        // Obtener thumbnail url
        this.storage.ref(thumbnailPath).getDownloadURL().subscribe(url => {
            let mediaInfo: FirebaseVideoInfo = new FirebaseVideoInfo();
            mediaInfo.thumbnailFilepath = thumbnailPath;
            mediaInfo.thumbnailName = thumbnailName;
            mediaInfo.thumbnailExt = thumbnailExt;
            mediaInfo.thumbnailUrl = url;
            mediaInfo.videoFilepath = videoPath;
            mediaInfo.videoName = videoName;
            mediaInfo.videoExt = videoExt;
            this.videoCol.push(mediaInfo);
            if(this.videoCol.length == this.familiesService.currentBird.videoGallery.length){
                this.spinnerService.hideSpinner();
            }
        });
    }

    goBack() {
        this.router.navigate(['birdFamilies/birds', this.familyId]);
    }

    previewVideo(video: FirebaseVideoInfo, content) {
        if (video.videoUrl == undefined) {
            this.spinnerService.showSpinner();
            this.storage.ref(video.videoFilepath).getDownloadURL().subscribe(url => {
                video.videoUrl = url;
                this.familiesService.previewUrl = url;
                this.familiesService.previewType = `video/${video.videoExt}`;
                this.spinnerService.hideSpinner();
                this.openModal(content);
            });
        } else {
            this.familiesService.previewUrl = video.videoUrl;
            this.familiesService.previewType = `video/${video.videoExt}`;
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

    addNewVideo(uploadVideoModal) {
        this.modalService.open(uploadVideoModal).result.then((result) => {
            //Notificar
            if (result == 'Save') {
                // Actualizar info
                this.familiesService.currentBird.videoGallery.push({
                    'videoName': this.newVideoFileName,
                    'ext': this.newVideoExt,
                    'thumbnail': this.newThumbnailFileName,
                    'thumbnailExt': this.newThumbnailExt,
                    'authorInfo': this.authorInfo
                });
                this.dataApi.updateBird(this.familiesService.currentBird);
                // Crear archivo
                let mediaInfo: FirebaseVideoInfo = new FirebaseVideoInfo();
                mediaInfo.thumbnailFilepath = this.newThumbnailFilePath;
                mediaInfo.thumbnailName = this.newThumbnailFileName;
                mediaInfo.thumbnailExt = this.newThumbnailExt;
                mediaInfo.videoFilepath = this.newVideoFilePath;
                mediaInfo.videoName = this.newVideoFileName;
                mediaInfo.videoExt = this.newVideoExt;
                this.createFileInDb(this.newFile, this.newThumbnailBlob, mediaInfo);
            } else {
				this.nulearCamposUpload();
			}
        }, (reason) => {
            this.nulearCamposUpload();
            // Cancel
        });
    }

    onUpload(e) {
        this.newFile = e.target.files[0];
        this.videoName = this.newFile.name;
        // Genero thumbnail
        this.videoService.generateThumbnail(this.newFile).then((thumbnail) => {
            this.newThumbnailBlob = this.b64toBlob(thumbnail);
            // Creo nombre
            const id = Math.random().toString(36).substring(2);
            this.newVideoFileName = `${this.familiesService.currentBird.esInfo.scientificName.replace(/\s/g, '')}_V_${id}`;
            this.newVideoExt = this.newFile.type.split('/')[1];
            this.newThumbnailFileName = `${this.familiesService.currentBird.esInfo.scientificName.replace(/\s/g, '')}_VT_${id}`;
            this.newThumbnailExt = 'jpeg'

            this.newVideoFilePath = `${Constants.BIRDS_FOLDER_NAME}/${this.newVideoFileName}.${this.newVideoExt}`;
            this.newThumbnailFilePath = `${Constants.BIRDS_FOLDER_NAME}/${this.newThumbnailFileName}.${this.newThumbnailExt}`;
            this.fileLoaded = true;
        }).catch(err => console.log('err', err))
    }

    createFileInDb(videoFile: File, thumbnailBlob: Blob, videoInfo: FirebaseVideoInfo) {
        // Si no encuentra el archivo crea uno nuevo
        this.storage.ref(videoInfo.videoFilepath);
        const videoTask = this.storage.upload(videoInfo.videoFilepath, videoFile);
        this.uploadPercent.push(
            new UploadingState(
                videoTask.percentageChanges(),
                videoInfo.videoName
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

        videoTask.snapshotChanges().pipe(finalize(() => {
            const thumbTask = this.storage.upload(videoInfo.thumbnailFilepath, thumbnailBlob);
            thumbTask.snapshotChanges().pipe(finalize(() => {
                this.storage.ref(videoInfo.thumbnailFilepath).getDownloadURL().subscribe(url => {
                    videoInfo.thumbnailUrl = url;
                    this.videoCol.push(videoInfo);
                    this.toastr.success(this.languageService.content.ADDED_VIDEO_SUCCESFULLY);
                });
            })).subscribe();
        })).subscribe();

        setTimeout(() => {
            this.nulearCamposUpload();
        }, 100);
    }

    nulearCamposUpload(){
        this.newThumbnailFilePath = null;
        this.newThumbnailFileName = null;
        this.newThumbnailExt = null;
        this.newVideoFilePath = null;
        this.newVideoFileName = null;
        this.newVideoExt = null;
        this.authorInfo = null;
        this.videoName = this.languageService.content.BROWSE;
    }

    b64toBlob(dataURI): Blob {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    deleteVideo(selVideo: FirebaseVideoInfo, index: number) {
        this.spinnerService.showSpinner();
        let foundIndex = this.familiesService.currentBird.videoGallery.findIndex(elem => elem.videoName == selVideo.videoName);
        this.familiesService.currentBird.videoGallery.splice(foundIndex, 1);
        // Actualizo
        this.dataApi.updateBird(this.familiesService.currentBird);

        // TODO Confirmar eliminacion
        let ref = this.storage.ref(selVideo.videoFilepath);
        ref.delete().subscribe(() => {
            let thmbRef = this.storage.ref(selVideo.thumbnailFilepath);
            thmbRef.delete().subscribe(() => {
                this.videoCol.splice(index, 1);
                // Cuando acaba de eliminar
                this.spinnerService.hideSpinner();
                this.toastr.success(this.languageService.content.VIDEO_DELETED);
            })
        })
    }

    cerrarProgress() {
        this.familiesService.cerrarProgress(this.uploadPercent, this.cerrarBtn, this.galleryContainer);
    }
}
