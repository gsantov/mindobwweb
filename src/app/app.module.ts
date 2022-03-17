import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { TrailsComponent } from './components/trails/trails.component';
import { BirdfamiliesComponent } from './components/birdfamilies/birdfamilies.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditHotspotComponent } from './components/hotspot/edit-hotspot/edit-hotspot.component';
import { AddBirdComponent } from './components/hotspot/edit-hotspot/add-bird/add-bird.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { EditTrailComponent } from './components/trails/edit-trail/edit-trail.component';
import { AddHotspotComponent } from './components/trails/edit-trail/add-hotspot/add-hotspot.component';
import { EditFamiliesComponent } from './components/birdfamilies/edit-families/edit-families.component';
import { BirdSpeciesComponent } from './components/birdfamilies/bird-species/bird-species.component';
import { EditBirdComponent } from './components/birdfamilies/bird-species/edit-bird/edit-bird.component';
import { ImagesComponent } from './components/birdfamilies/bird-species/images/images.component';
import { VideosComponent } from './components/birdfamilies/bird-species/videos/videos.component';
import { VideoProcessingService } from './components/birdfamilies/bird-species/videos/videoProcessingService';
import { ImageProcessingService } from './components/birdfamilies/bird-species/images/imageProcessingService';
import { PreviewModalComponent } from './components/preview-modal/preview-modal.component';
import { SoundsComponent } from './components/birdfamilies/bird-species/sounds/sounds.component';
import { CookieService } from 'ngx-cookie-service';
import { Ng2LoadingSpinnerModule } from 'ng2-loading-spinner'


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HotspotComponent,
    TrailsComponent,
    BirdfamiliesComponent,
    SidebarComponent,
    HeaderComponent,
    EditHotspotComponent,
    AddBirdComponent,
    EditTrailComponent,
    AddHotspotComponent,
    EditFamiliesComponent,
    BirdSpeciesComponent,
    EditBirdComponent,
    ImagesComponent,
    VideosComponent,
    PreviewModalComponent,
    SoundsComponent
  ],
  imports: [
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    NgbModule,
    Ng2LoadingSpinnerModule.forRoot({})
  ],
  providers: [
    AngularFireAuth,
    AngularFirestore,
    VideoProcessingService,
    ImageProcessingService,
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    PreviewModalComponent
  ]
})
export class AppModule { }
