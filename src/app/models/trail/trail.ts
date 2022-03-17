import { TrailInfo } from './trainlInfo'
import { BaseModel } from '../baseModel';

export class TrailModel extends BaseModel{
    routeId?: number;
    imageName?: string;
    ext?: string;
    birdColRef?:string[];
    poiColRef?:string[];
    esInfo?:TrailInfo;
    enInfo?:TrailInfo;

    distanceNotation:string;
    distance?:number;

    constructor(){
        super();
        this.esInfo = new TrailInfo();
        this.enInfo = new TrailInfo();
        this.birdColRef = new Array();
        this.poiColRef = new Array();
    }
}
