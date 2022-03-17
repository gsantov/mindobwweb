import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    public homeOpt: HTMLElement;
    public hotspotOpt: HTMLElement;
    public trailsOpt: HTMLElement;
    public familiesOpt: HTMLElement;
    public birdsOpt: HTMLElement;

    constructor() {
        
    }

    init(){
        this.homeOpt = document.getElementById('homeOpt') as HTMLElement;
        this.hotspotOpt = document.getElementById('hotspotOpt') as HTMLElement;
        this.trailsOpt = document.getElementById('trailsOpt') as HTMLElement;
        this.familiesOpt = document.getElementById('familiesOpt') as HTMLElement;
        this.birdsOpt = document.getElementById('birdsOpt') as HTMLElement;
    }

    activateSection(sectionNumber:number){
        this.init();
        this.homeOpt.className = sectionNumber == 0 ? 'active' : '';
        this.hotspotOpt.className = sectionNumber == 1 ? 'active' : '';
        this.trailsOpt.className = sectionNumber == 2 ? 'active' : '';
        this.familiesOpt.className = sectionNumber == 3 ? 'active' : '';
        this.birdsOpt.className = sectionNumber == 4 ? 'active' : '';
    }
}
