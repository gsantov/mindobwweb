import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataApiService } from '../../services/data-api.service';
import { VersionModel } from '../../models/version';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../services/language.service';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    public isLogged: boolean = false;
    public currentVersion:VersionModel;
    private versionSubscription:Subscription;

    constructor(private authService: AuthService, private modalService: NgbModal, 
        private dataApi: DataApiService, private toastr: ToastrService, public languageService:LanguageService) { }

    ngOnInit() {
        this.languageService.intiLanguageService();
        this.languageService.getLanguage();
        this.authService.isAuth().subscribe(auth => {
            if (auth) {
                this.isLogged = true;
            } else {
                this.isLogged = false;
            }
        });
    }

    // Notificar cambio de version
    notificarCambio(confirmModal) {
        this.modalService.open(confirmModal, { centered: true }).result.then((result) => {
            //Notificar
            if (result == 'Save') {
                this.versionSubscription = this.dataApi.getAllVersion().subscribe(versions => {
                    this.currentVersion = versions[0];
                    this.currentVersion.version++;
                    this.dataApi.updateVersion(this.currentVersion);
                    this.versionSubscription.unsubscribe();
                    this.toastr.success(this.languageService.content.NOTIFICATION_SUCCESFULLY);
                    this.currentVersion = null;
                })
            }
        }, (reason) => {
        });
    }

}
