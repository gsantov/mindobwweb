import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { LanguageService } from '../../services/language.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private navigationService:NavigationService, public languageService:LanguageService) { }

  ngOnInit() {
    this.navigationService.activateSection(0);
  }

}
