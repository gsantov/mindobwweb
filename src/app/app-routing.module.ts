import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { BirdfamiliesComponent } from './components/birdfamilies/birdfamilies.component';
import { EditFamiliesComponent } from './components/birdfamilies/edit-families/edit-families.component';
import { BirdSpeciesComponent } from './components/birdfamilies/bird-species/bird-species.component'
import { EditBirdComponent } from './components/birdfamilies/bird-species/edit-bird/edit-bird.component'
import { ImagesComponent } from './components/birdfamilies/bird-species/images/images.component'
import { VideosComponent } from './components/birdfamilies/bird-species/videos/videos.component'
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { EditHotspotComponent } from './components/hotspot/edit-hotspot/edit-hotspot.component';
import { TrailsComponent } from './components/trails/trails.component';
import { EditTrailComponent } from './components/trails/edit-trail/edit-trail.component';
import { AuthGuard } from './guards/auth.guard';
import { SoundsComponent } from './components/birdfamilies/bird-species/sounds/sounds.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'birdFamilies', component: BirdfamiliesComponent, canActivate: [AuthGuard] },
  { path: 'birdFamilies/edit/:id', component: EditFamiliesComponent, canActivate: [AuthGuard] },
  { path: 'birdFamilies/birds/:id', component: BirdSpeciesComponent, canActivate: [AuthGuard] },
  { path: 'birdFamilies/birds/:id/edit/:bid', component: EditBirdComponent, canActivate: [AuthGuard] },

  { path: 'birdFamilies/birds/:id/images/:bid', component: ImagesComponent, canActivate: [AuthGuard] },
  { path: 'birdFamilies/birds/:id/videos/:bid', component: VideosComponent, canActivate: [AuthGuard] },
  { path: 'birdFamilies/birds/:id/sounds/:bid', component: SoundsComponent, canActivate: [AuthGuard] },
  // Hotspots
  { path: 'hostpots', component: HotspotComponent, canActivate: [AuthGuard] },
  { path: 'hostpots/edit/:id', component: EditHotspotComponent, canActivate: [AuthGuard] },

  { path: 'routes', component: TrailsComponent, canActivate: [AuthGuard] },
  { path: 'routes/edit/:id', component: EditTrailComponent, canActivate: [AuthGuard] },

  // otherwise redirect to home
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
