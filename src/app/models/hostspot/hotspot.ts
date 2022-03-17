import { GeoPoint } from '../geoPoint'
import { HotspotInfo } from './hotspotInfo';
import { BaseModel } from '../baseModel';

export class HotspotModel extends BaseModel{
    imageName?: string;
    ext?: string;
    location?: GeoPoint;
    birdColRef?:string[];
    esInfo?:HotspotInfo;
    enInfo?:HotspotInfo;

    constructor(){
        super();
        this.location = new GeoPoint();
        this.esInfo = new HotspotInfo();
        this.enInfo = new HotspotInfo();
        this.birdColRef = new Array();
    }
}
