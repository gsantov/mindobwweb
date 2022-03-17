import { Observable } from 'rxjs';

export class UploadingState {
    uploadPercent?: Observable<number>;
    fileName?:string;
    finished?:boolean;

    constructor(uploadPercent:Observable<number>, fileName:string){
        this.uploadPercent = uploadPercent;
        this.fileName = fileName;
    }

}