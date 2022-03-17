import { Injectable } from '@angular/core';
import { FamilyModel } from '../../../models/family/family';
import { BirdModel } from '../../../models/bird/bird';
import { HotspotModel } from '../../../models/hostspot/hotspot';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotspotService {

  public allFamilies:FamilyModel[];
  public allBirds:BirdModel[];
  public currentHotspot: HotspotModel;
  public currentBirdCol:BirdModel[];

  public filteredBirds: Observable<BirdModel[]>;
  public filter:FormControl = new FormControl('');

  constructor() { }

  
}
