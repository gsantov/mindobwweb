import { Component, OnInit } from '@angular/core';
import { TrailService } from '../services/trail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../services/data-api.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastrService } from 'ngx-toastr';
import { TrailModel } from '../../../models/trail/trail';
import { startWith, map, finalize } from 'rxjs/operators';
import { HotspotModel } from '../../../models/hostspot/hotspot';
import { Constants } from '../../constants';
import { Observable } from 'rxjs';

import { ImageProcessingService } from '../../birdfamilies/bird-species/images/imageProcessingService';
import { PreviewModalService } from '../../preview-modal/preview-modal.service';
import { NgForm } from '@angular/forms';
import { LanguageService } from '../../../services/language.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
    selector: 'app-edit-trail',
    templateUrl: './edit-trail.component.html',
    styleUrls: ['./edit-trail.component.css']
})
export class EditTrailComponent implements OnInit {

    private isNew: boolean;
    public sectionTitle: string;
    public imageName: string;
    private file: File;
    private filePath: string;
    public imagePreviewButton: HTMLElement;
	public customFileContainer: HTMLElement;
    public uploadPercent: Observable<number>;
    public submit:boolean;
    public fileLoaded:boolean;

    constructor(private route: ActivatedRoute, private dataApi: DataApiService,
        private storage: AngularFireStorage, public trailService: TrailService,
        private router: Router, private toastr: ToastrService, private imageService: ImageProcessingService,
        private previewModalService: PreviewModalService, public languageService:LanguageService, public spinnerService: SpinnerService) { }

    ngOnInit() {
        this.spinnerService.showSpinner();
        this.submit = false;
		this.fileLoaded = false;
        this.imagePreviewButton = document.getElementById("preview-image-btn") as HTMLElement;
		this.customFileContainer = document.getElementById("custom-file-inline-container") as HTMLElement;
        this.trailService.currentHotspotCol = new Array();
        let routeId = this.route.snapshot.params['id'];
        if (routeId == 0) {
            this.imagePreviewButton.style.display = 'none';
			this.customFileContainer.style.width = '100%';
            this.isNew = true;
            this.sectionTitle = 'Nuevo';
            this.imageName = this.languageService.content.BROWSE;
            this.trailService.currentRoute = new TrailModel();
            this.loadData(false);
        } else {
            this.isNew = false;
            this.sectionTitle = this.languageService.content.EDIT_LABEL;
            this.dataApi.getRouteById(routeId).subscribe(route => {
                this.imagePreviewButton.style.display = 'inline-block';
				this.customFileContainer.style.width = 'calc(100% - 43px)';
                this.imageName = `${route.imageName}.${route.ext}`;
                this.trailService.currentRoute = route;
                this.loadData(true);
            });
        }
    }

    loadData(loadCurrentHotspots: boolean) {
        this.dataApi.getAllHotspots().subscribe(hotspots => {
            this.trailService.allHotspots = hotspots;
            if (loadCurrentHotspots) {
                this.trailService.currentRoute.poiColRef.forEach(elem => {
                    this.trailService.currentHotspotCol.push(
                        this.trailService.allHotspots.find(hotspot => hotspot.id == elem)
                    );  
                })
            }
            // Inicializo para busqueda en modal addf
            this.trailService.filteredHotspots = this.trailService.filter.valueChanges.pipe(
                startWith(''),
                map(text => this.search(text))
            );
            this.spinnerService.hideSpinner();
        })
    }

    search(text: string): HotspotModel[] {
        return this.trailService.allHotspots.filter(hotspot => {
            const term = text.toLowerCase();
            return this.languageService.getInfoByLanguage(hotspot, 'title').toLowerCase().includes(term);
        });
    }

    onUpload(e) {
        this.file = e.target.files[0];
        this.imageName = this.file.name;
        this.imageService.compress(this.file).subscribe(thumbnailFile => { 
            this.file = thumbnailFile;
            if (this.trailService.currentRoute.imageName == null) {
                // Creo nombre
                const id = Math.random().toString(36).substring(2);
                this.trailService.currentRoute.imageName = `route_${id}`;
                this.trailService.currentRoute.ext = this.file.type.split('/')[1];
            }
            this.filePath = `${Constants.ROUTES_FOLDER_NAME}/${this.trailService.currentRoute.imageName}.${this.trailService.currentRoute.ext}`;
            this.imagePreviewButton.style.display = 'inline-block';
            this.customFileContainer.style.width = 'calc(100% - 43px)';
            this.fileLoaded = true;
        });
    }

    deleteHotspot(id: string, index: number) {
        let foundIndex = this.trailService.currentRoute.poiColRef.findIndex(elem => elem === id);
        this.trailService.currentRoute.poiColRef.splice(foundIndex, 1);
        this.trailService.currentHotspotCol.splice(index, 1);
    }

    saveToDb(form:NgForm) {
        this.submit = true;
        this.fileLoaded = this.file != undefined || this.trailService.currentRoute.imageName != undefined;
        if(form.valid && this.fileLoaded){
            this.spinnerService.showSpinner();
            let relatedBirds:string[] = new Array();
            this.trailService.currentHotspotCol.forEach(elem => relatedBirds = relatedBirds.concat(elem.birdColRef));
            this.trailService.currentRoute.birdColRef = relatedBirds.filter((item, pos) => relatedBirds.indexOf(item) == pos);
            if (this.isNew) {
                this.dataApi.addRoute(this.trailService.currentRoute);
            } else {
                this.dataApi.updateRoute(this.trailService.currentRoute);
            }
            // Compruebo si se ha cambiado
            if (this.filePath != undefined && this.file != undefined) {
                this.storage.ref(this.filePath);
                // Compruebo si existe un archivo para este hotspot
                this.createFileInDb().subscribe();
            } else {
                this.spinnerService.hideSpinner();
                this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
                this.goBack();
            }
        } else { 
			this.toastr.error(this.languageService.content.PLEASE_FILL_REQUIRED);
		}
    }

    createFileInDb() {
        // Si no encuentra el archivo crea uno nuevo
        const task = this.storage.upload(this.filePath, this.file);
        this.uploadPercent = task.percentageChanges();
        // Cuando acaba de cargar se llama a goBack
        return task.snapshotChanges().pipe(finalize(() => {
            this.toastr.success(this.languageService.content.MSG_SAVED_SUCCESFULLY);
            this.spinnerService.hideSpinner();
            this.goBack();
        }));
    }

    goBack() {
        this.router.navigate(['routes']);
    }

    previewImage() {
		this.previewModalService.setPreviewImage(this.file, Constants.ROUTES_FOLDER_NAME, 
			this.trailService.currentRoute.imageName, this.trailService.currentRoute.ext);
    } 
    
    clearSearch(){
        this.trailService.filter.setValue('');
    }
}
