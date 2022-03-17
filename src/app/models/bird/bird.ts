import { BirdInfo } from './birdInfo'
import { ImageInfo } from './imageInfo';
import { VideoInfo } from './videoInfo';
import { SoundInfo } from './soundInfo';
import { BaseModel } from '../baseModel';

export class BirdModel extends BaseModel{
    familyId?: string;
    imageName?: string;
    ext?: string;
    inDanger?:boolean;
    esInfo?:BirdInfo;
    enInfo?:BirdInfo;

    imageGallery?:ImageInfo[];
    videoGallery?:VideoInfo[];
    soundGallery?:SoundInfo[];

    familyName?:string;

    constructor(){
        super();
        this.esInfo = new BirdInfo();
        this.enInfo = new BirdInfo();
    }
}
