import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../services/language.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    public email: string;
    public password: string;
    public submit: boolean;
    public language: string;

    constructor(private router: Router, private authService: AuthService, private toastr: ToastrService,
        private cookieService:CookieService, public languageService:LanguageService, public spinnerService:SpinnerService) { }

    ngOnInit() {
        this.submit = false;
        this.language = this.languageService.availableLanguages[0].acronym;
        this.languageService.setLanguage(this.language);
    }

    onLogin(form:NgForm) {
        this.submit = true;
        this.languageService.setLanguage(this.language);
        if(form.valid){
            this.spinnerService.showSpinner();
            this.authService.loginUser(this.email, this.password)
            .then((response) => {
                this.spinnerService.hideSpinner();
                this.router.navigate(['home'])
            }).catch(err => {
                this.spinnerService.hideSpinner();
                if(err.code == "auth/user-not-found"){
                    this.toastr.error(this.languageService.content.USER_NOT_FOUND);
                } else if(err.code == 'auth/wrong-password'){
                    this.toastr.error(this.languageService.content.WRONG_PASS);
                } else if(err.code == "auth/too-many-requests"){
                    this.toastr.error(this.languageService.content.TOO_MAY_FAILS);
                } else {
                    this.toastr.error(this.languageService.content.GENERIC_LOGIN_ERROR);
                }
            });
        } else {
            this.toastr.error(this.languageService.content.PLEASE_FILL_REQUIRED);
        }
    }

}
