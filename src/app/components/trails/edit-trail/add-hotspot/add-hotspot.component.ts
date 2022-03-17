import { Component, OnInit } from '@angular/core';
import { TrailService } from '../../services/trail.service';
import { ToastrService } from 'ngx-toastr';
import { HotspotModel } from '../../../../models/hostspot/hotspot';
import { LanguageService } from '../../../../services/language.service';

@Component({
    selector: 'app-add-hotspot',
    templateUrl: './add-hotspot.component.html',
    styleUrls: ['./add-hotspot.component.css']
})
export class AddHotspotComponent implements OnInit {

    constructor(public trailService: TrailService, private toastr: ToastrService, public languageService:LanguageService) { }

    ngOnInit() {
    }

    isAvailable(id: string) {
        let exist: string = this.trailService.currentRoute.poiColRef.find(hotspot => hotspot == id);
        return exist == undefined ? false : true;
    }

    add(selectedHotspot: HotspotModel): void {
        this.trailService.currentRoute.poiColRef.push(selectedHotspot.id);
        this.trailService.currentHotspotCol.push(selectedHotspot);
        this.toastr.success(`${this.languageService.getInfoByLanguage(selectedHotspot, 'title')} ${this.languageService.content.ADDED}`);
    }

    remove(selectedHotspot: HotspotModel): void {
        let foundIndex = this.trailService.currentRoute.poiColRef.findIndex(elem => elem === selectedHotspot.id)
        this.trailService.currentRoute.poiColRef.splice(foundIndex, 1);
        let foundIndexH = this.trailService.currentHotspotCol.findIndex(elem => elem.id === selectedHotspot.id);
        this.trailService.currentHotspotCol.splice(foundIndexH, 1);
        this.toastr.error(`${this.languageService.getInfoByLanguage(selectedHotspot, 'title')} ${this.languageService.content.REMOVED}`);
    }

}
