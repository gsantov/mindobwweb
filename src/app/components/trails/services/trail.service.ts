import { Injectable } from '@angular/core';
import { HotspotModel } from '../../../models/hostspot/hotspot';
import { BirdModel } from '../../../models/bird/bird';
import { TrailModel } from '../../../models/trail/trail';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class TrailService {

  public allHotspots:HotspotModel[];
  public allBirds:BirdModel[];
  public currentRoute: TrailModel;
  public currentHotspotCol:HotspotModel[];

  public filteredHotspots: Observable<HotspotModel[]>;
  public filter:FormControl = new FormControl('');

  constructor() { }
}
