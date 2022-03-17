import { Component, OnInit } from '@angular/core';
import { BirdModel } from '../../../../models/bird/bird';
import { HotspotService } from '../../services/hotspot.service';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../../../services/language.service';

@Component({
    selector: 'add-bird-modal',
    templateUrl: './add-bird.component.html',
    styleUrls: ['./add-bird.component.css']
})
export class AddBirdComponent implements OnInit {

    constructor(public hotspotService: HotspotService, private toastr: ToastrService, public languageService:LanguageService) { }

    ngOnInit() { }

    isAvailable(id: string) {
        let exist: string = this.hotspotService.currentHotspot.birdColRef.find(bird => bird == id);
        return exist == undefined ? false : true;
    }

    add(selectedBird: BirdModel): void {
        this.hotspotService.currentHotspot.birdColRef.push(selectedBird.id);
        this.hotspotService.currentBirdCol.push(selectedBird);
        this.toastr.success(`${selectedBird.esInfo.scientificName} ${this.languageService.content.ADDED}`);
    }

    remove(selectedBird: BirdModel): void {
        let foundIndex = this.hotspotService.currentHotspot.birdColRef.findIndex(elem => elem === selectedBird.id);
        this.hotspotService.currentHotspot.birdColRef.splice(foundIndex, 1);
        let foundIndexBird = this.hotspotService.currentBirdCol.findIndex(elem => elem === selectedBird.id);
        this.hotspotService.currentBirdCol.splice(foundIndexBird, 1);
        this.toastr.error(`${selectedBird.esInfo.scientificName} ${this.languageService.content.REMOVED}`);
    }
}