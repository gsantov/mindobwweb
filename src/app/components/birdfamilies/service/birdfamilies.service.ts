import { Injectable } from '@angular/core';
import { FamilyModel } from '../../../models/family/family';
import { BirdModel } from '../../../models/bird/bird';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UploadingState } from 'src/app/models/bird/uploadingState';

@Injectable({
  providedIn: 'root'
})
export class BirdfamiliesService {

  public allFamilies: FamilyModel[];
  public allBirds: BirdModel[];
  public currentFamily: FamilyModel;
  public currentBirdCol: BirdModel[];
  public currentBird: BirdModel;

  public previewUrl: string;
  public previewType: string;

  public filteredBirds: Observable<BirdModel[]>;
  public filter: FormControl = new FormControl('');

  constructor() { }

  cerrarProgress(uploadPercent: UploadingState[], cerrarBtn: HTMLElement, galleryContainer: HTMLElement) {
    let allfinished = true;
    uploadPercent.forEach(elem => {
      if (!elem.finished) {
        allfinished = false;
      }
    })
    if (allfinished) {
      cerrarBtn.style.display = 'none';
      galleryContainer.style.marginBottom = '0px';
      uploadPercent = new Array();
    }
  }
}
