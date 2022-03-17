import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataApiService } from '../../../../services/data-api.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { BirdfamiliesService } from '../../service/birdfamilies.service';
import { ToastrService } from 'ngx-toastr';
import { Constants } from '../../../constants';
import { Observable, Subject, merge, Subscription } from 'rxjs';
import { finalize, debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { BirdModel } from '../../../../models/bird/bird';
import { ImageProcessingService } from '../images/imageProcessingService';
import { PreviewModalService } from '../../../preview-modal/preview-modal.service';
import { NgForm } from '@angular/forms';
import { LanguageService } from '../../../../services/language.service';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FamilyModel } from '../../../../models/family/family';
import { SpinnerService } from '../../../../services/spinner.service';

@Component({
    selector: 'app-edit-bird',
    templateUrl: './edit-bird.component.html',
    styleUrls: ['./edit-bird.component.css']
})
export class EditBirdComponent implements OnInit {

    @ViewChild('bfamilyid') instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

    public sectionTitle: string;
    private file: File;
    private filePath: string;
    public imageName: string;
    public isNew: boolean;
    private familyId;
    private birdId;
    public checkDanger: boolean = false;
    public imagePreviewButton: HTMLElement;
    public customFileContainer: HTMLElement;
    public uploadPercent: Observable<number>;
    public submit: boolean;
    public fileLoaded: boolean;
    public currentFamily: FamilyModel;
    public currentFamilyValid: boolean = true;
    public disableFamilyInput: boolean;
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
        this.familiesService.currentBird = new BirdModel();
        this.familyId = this.route.snapshot.params['id'];
        this.birdId = this.route.snapshot.params['bid'];
        // LOAD ALL FAMILIES
        this.dataApi.getAllFamilies().subscribe(families => {
            this.familiesService.allFamilies = families;
            // buscar family
            if (this.familyId != 'all') {
                this.currentFamily = this.familiesService.allFamilies.find(family => family.id == this.familyId);
            }
            if (this.birdId == 0) {
                this.imagePreviewButton.style.display = 'none';
                this.customFileContainer.style.width = '100%';
                this.isNew = true;
                this.sectionTitle = 'Nuevo';
                this.imageName = this.languageService.content.BROWSE;
                this.disableFamilyInput = this.route.snapshot.params['id'] != 'all';
                this.spinnerService.hideSpinner();
            } else {
                this.isNew = false;
                this.sectionTitle = this.languageService.content.EDIT_LABEL;
                this.dataApi.getBirdByBirdId(this.birdId).subscribe(bird => {
                    this.imagePreviewButton.style.display = 'inline-block';
                    this.customFileContainer.style.width = 'calc(100% - 43px)';
                    this.imageName = `${bird.imageName}.${bird.ext}`;
                    this.familiesService.currentBird = bird;
                    this.disableFamilyInput = true;
                    this.currentFamily = this.familiesService.allFamilies.find(family => family.id == this.familiesService.currentBird.familyId);
                    this.spinnerService.hideSpinner();
                });
            }
        });

    }

    onUpload(e) {
        this.file = e.target.files[0];
        this.imageName = this.file.name;
        this.imageService.compress(this.file).subscribe(thumbnailFile => {
            this.file = thumbnailFile;
            if (this.familiesService.currentBird.imageName == null) {
                // Creo nombre
                const id = Math.random().toString(36).substring(2);
                this.familiesService.currentBird.imageName = `bird_${id}`;
                this.familiesService.currentBird.ext = this.file.type.split('/')[1];
            }
            this.filePath = `${Constants.BIRDS_FOLDER_NAME}/${this.familiesService.currentBird.imageName}.${this.familiesService.currentBird.ext}`;
            this.imagePreviewButton.style.display = 'inline-block';
            this.customFileContainer.style.width = 'calc(100% - 43px)';
            this.fileLoaded = true;
        });
    }

    saveToDb(form: NgForm) {
        this.verifySelectedFamily();
        this.submit = true;
        this.fileLoaded = this.file != undefined || this.familiesService.currentBird.imageName != undefined;
        if (form.valid && this.fileLoaded && this.currentFamilyValid) {
            this.spinnerService.showSpinner();
            if (this.isNew) {
                this.verifyRepeatedSubscription = this.dataApi.getBirdsByScientificName(this.familiesService.currentBird.esInfo.scientificName)
                    .subscribe(repeatedBirdCol => {
                        this.verifyRepeatedSubscription.unsubscribe();
                        if (repeatedBirdCol.length == 0) {
                            this.familiesService.currentBird.familyId = this.currentFamily.id;
                            this.dataApi.addBird(this.familiesService.currentBird);
                            this.saveFile();
                        } else {
                            this.spinnerService.hideSpinner();
                            this.toastr.error(this.languageService.content.SPECIE_ALREADY_EXIST);
                        }
                    });
            } else {
                this.familiesService.currentBird.familyId = this.currentFamily.id;
                this.dataApi.updateBird(this.familiesService.currentBird);
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
        this.router.navigate(['birdFamilies/birds', this.familyId]);
    }

    changeScientificName() {
        this.familiesService.currentBird.enInfo.scientificName = this.familiesService.currentBird.esInfo.scientificName;
    }

    changeDanger() {
        this.familiesService.currentBird.esInfo.dangerInfo = undefined;
        this.familiesService.currentBird.enInfo.dangerInfo = undefined;
    }

    previewImage() {
        this.previewModalService.setPreviewImage(this.file, Constants.BIRDS_FOLDER_NAME,
            this.familiesService.currentBird.imageName, this.familiesService.currentBird.ext);
    }

    verifySelectedFamily() {
        this.currentFamilyValid = typeof this.currentFamily == 'object';
    }

    formatter = (result: FamilyModel) => result.scientificName;

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term === '' ? []
                : this.familiesService.allFamilies.filter(v => v.scientificName.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )
}
