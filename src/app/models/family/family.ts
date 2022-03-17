import { FamilyInfo } from './familyInfo';
import { BaseModel } from '../baseModel';

export class FamilyModel extends BaseModel {
    imageName?: string;
    ext?: string;
    scientificName?:string;
    esInfo?:FamilyInfo;
    enInfo?:FamilyInfo;

    constructor(){
        super();
        this.esInfo = new FamilyInfo();
        this.enInfo = new FamilyInfo();
    }
}
