import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    public isLogged: boolean = false;

    constructor(private authService: AuthService, private router: Router, public languageService: LanguageService,
        public spinnerService: SpinnerService) { }

    ngOnInit() {
        this.getCurrentUser();
    }

    logout() {
        this.authService.logoutUser();
        this.router.navigate(['login'])
    }

    getCurrentUser() {
        this.spinnerService.showSpinner();
        this.authService.isAuth().subscribe(auth => {
            this.spinnerService.hideSpinner();
            if (auth) {
                this.isLogged = true;
                this.setSidebarToggler();
                if (window.location.pathname == '/login') {
                    this.router.navigate(['/home']);
                }
            } else {
                this.isLogged = false;
            }
        });
    }

    toggleSidebar() {
        $('#sidebar').toggleClass('active');
    }

    setSidebarToggler() {
        $(document).ready(() => {
            $('#sidebarCollapse').on('click', () => {
                $('#sidebar').toggleClass('active');
            });
        });
    }

}
