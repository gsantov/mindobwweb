import { Component } from '@angular/core';
import { PreviewModalService } from './preview-modal.service';

@Component({
    selector: 'app-preview-modal',
    templateUrl: './preview-modal.component.html',
    styleUrls: ['./preview-modal.component.css']
})
export class PreviewModalComponent  {

    constructor(public previewModalService:PreviewModalService) { }
}
