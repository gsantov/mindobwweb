import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';

@Injectable({
    providedIn: 'root'
})
export class PreviewModalService {

    public preview: string;
    public subscription:Subscription;

    constructor(private storage: AngularFireStorage, public spinnerService: SpinnerService) { }

    setPreviewImage(file: File, folder: string, imageName: string, ext: string): void {
        if (file == undefined) {
            this.spinnerService.showSpinner();
            let filePath = `${folder}/${imageName}.${ext}`;
            this.subscription = this.storage.ref(filePath).getDownloadURL().subscribe(url => {
                this.preview = url;
                this.subscription.unsubscribe();
                this.spinnerService.hideSpinner();
            });
        } else {
            this.getBase64(file).then((base64) => {
                this.preview = base64.toString();
            });
        }
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }


}
