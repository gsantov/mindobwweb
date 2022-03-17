import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { HotspotModel } from '../models/hostspot/hotspot';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { BirdModel } from '../models/bird/bird';
import { FamilyModel } from '../models/family/family';
import { TrailModel } from '../models/trail/trail';
import { VersionModel } from '../models/version';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { Constants } from '../components/constants';
import { ImageInfo } from '../models/bird/imageInfo';
import { VideoInfo } from '../models/bird/videoInfo';
import { SoundInfo } from '../models/bird/soundInfo';

@Injectable({
    providedIn: 'root'
})
export class DataApiService {

    private hotspotDoc: AngularFirestoreDocument<HotspotModel>;
    private hotspot: Observable<HotspotModel>;

    private routeDoc: AngularFirestoreDocument<TrailModel>;
    private route: Observable<TrailModel>;

    private familyDoc: AngularFirestoreDocument<FamilyModel>;
    private family: Observable<FamilyModel>;

    private versionCol: AngularFirestoreCollection<VersionModel>;
    private hotspotCol: AngularFirestoreCollection<HotspotModel>;
    private familiesCol: AngularFirestoreCollection<FamilyModel>;
    private birdsCol: AngularFirestoreCollection<BirdModel>;
    private trailsCol: AngularFirestoreCollection<TrailModel>;
    // private hotspots: Observable<HotspotModel[]>;

    private birdDoc: AngularFirestoreDocument<BirdModel>;
    private bird: Observable<BirdModel>;

    private transSubscription: Subscription;

    private HOTSPOT: string = 'POI';
    private ROUTE: string = 'ROUTE';
    private VERSION: string = 'VERSION';
    private BIRD: string = 'BIRD';
    private FAMILIES: string = 'FAMILIES';

    constructor(private afs: AngularFirestore, private afsAuth: AngularFireAuth, private storage: AngularFireStorage) { }

    getAllVersion(): Observable<VersionModel[]> {
        this.versionCol = this.afs.collection<VersionModel>(this.VERSION);
        return this.versionCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as VersionModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getAllHotspots(): Observable<HotspotModel[]> {
        this.hotspotCol = this.afs.collection<HotspotModel>(this.HOTSPOT);
        return this.hotspotCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as HotspotModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getHotspotById(id: string): Observable<HotspotModel> {
        this.hotspotDoc = this.afs.doc<HotspotModel>(`${this.HOTSPOT}/${id}`);
        return this.hotspot = this.hotspotDoc.snapshotChanges().pipe(map(action => {
            if (action.payload.exists === false) {
                return null;
            } else {
                const data = action.payload.data() as HotspotModel;
                data.id = action.payload.id;
                return data;
            }
        }));
    }

    getRouteById(id: string): Observable<TrailModel> {
        this.routeDoc = this.afs.doc<TrailModel>(`${this.ROUTE}/${id}`);
        return this.route = this.routeDoc.snapshotChanges().pipe(map(action => {
            if (action.payload.exists === false) {
                return null;
            } else {
                const data = action.payload.data() as TrailModel;
                data.id = action.payload.id;
                return data;
            }
        }));
    }

    getBirdByBirdId(id: string): Observable<BirdModel> {
        this.birdDoc = this.afs.doc<BirdModel>(`${this.BIRD}/${id}`);
        return this.bird = this.birdDoc.snapshotChanges().pipe(map(action => {
            if (action.payload.exists === false) {
                return null;
            } else {
                const data = action.payload.data() as BirdModel;
                data.id = action.payload.id;
                return data;
            }
        }));
    }

    getAllFamilies(): Observable<FamilyModel[]> {
        this.familiesCol = this.afs.collection<FamilyModel>(this.FAMILIES);
        return this.familiesCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as FamilyModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getAllBirds(): Observable<BirdModel[]> {
        this.birdsCol = this.afs.collection<BirdModel>(this.BIRD);
        return this.birdsCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as BirdModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getAllTrails() {
        this.trailsCol = this.afs.collection<TrailModel>(this.ROUTE);
        return this.trailsCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as TrailModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    addHotspot(hotspot: HotspotModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            hotspot.lastModifiedBy = usr.email;
            // Genero id aleatorio
            let id: string = 'H_' + Math.random().toString(36).substring(2);
            hotspot.id = id;
            // Convierto en string el objeto
            let jsonString: string = JSON.stringify(hotspot);
            // Guardo en base
            // this.hotspotCol.add(hotspot).then(() => {
            //     console.log("Document successfully written!");
            //     this.transSubscription.unsubscribe();
            // })
            this.hotspotCol.doc(id).set(JSON.parse(jsonString)).then(() => {
                console.log("Document successfully written!");
                this.transSubscription.unsubscribe();
            });
        });
    }

    updateHotspot(hotspot: HotspotModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            hotspot.lastModifiedBy = usr.email;
            this.hotspotDoc = this.afs.doc<HotspotModel>(`${this.HOTSPOT}/${hotspot.id}`);
            this.hotspotDoc.update(hotspot);
            this.transSubscription.unsubscribe();
        });

    }

    addRoute(route: TrailModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            route.lastModifiedBy = usr.email;
            // Genero id aleatorio
            let id: string = 'R_' + Math.random().toString(36).substring(2);
            route.id = id;
            // Convierto en string el objeto
            let jsonString: string = JSON.stringify(route);
            // Guardo en base
            this.afs.collection('ROUTE').doc(id).set(JSON.parse(jsonString)).then(() => {
                console.log("Document successfully written!");
                this.transSubscription.unsubscribe();
            });
        });
    }

    updateRoute(route: TrailModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            route.lastModifiedBy = usr.email;
            this.routeDoc = this.afs.doc<TrailModel>(`${this.ROUTE}/${route.id}`);
            this.routeDoc.update(route);
            this.transSubscription.unsubscribe();
        });
    }

    getFamilyById(id: string): Observable<FamilyModel> {
        this.familyDoc = this.afs.doc<FamilyModel>(`${this.FAMILIES}/${id}`);
        return this.family = this.familyDoc.snapshotChanges().pipe(map(action => {
            if (action.payload.exists === false) {
                return null;
            } else {
                const data = action.payload.data() as FamilyModel;
                data.id = action.payload.id;
                return data;
            }
        }));
    }

    getAllBirdsFromFamily(familyId: string) {
        this.birdsCol = this.afs.collection<BirdModel>(this.BIRD, ref => ref.where('familyId', '==', familyId));
        return this.birdsCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as BirdModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    addFamily(family: FamilyModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            family.lastModifiedBy = usr.email;
            // Genero id aleatorio
            let id: string = 'F_' + Math.random().toString(36).substring(2);
            family.id = id;
            // Convierto en string el objeto
            let jsonString: string = JSON.stringify(family);
            // Guardo en base
            this.afs.collection('FAMILIES').doc(id).set(JSON.parse(jsonString)).then(() => {
                console.log("Document successfully written!");
                this.transSubscription.unsubscribe();
            });
        });

    }

    updateFamily(family: FamilyModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            family.lastModifiedBy = usr.email;
            this.familyDoc = this.afs.doc<FamilyModel>(`${this.FAMILIES}/${family.id}`);
            this.familyDoc.update(family);
            this.transSubscription.unsubscribe();
        });
    }

    addBird(bird: BirdModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            bird.lastModifiedBy = usr.email;
            // Genero id aleatorio
            let id: string = 'B_' + Math.random().toString(36).substring(2);
            bird.id = id;
            // Convierto en string el objeto
            let jsonString: string = JSON.stringify(bird);
            // Guardo en base
            this.afs.collection('BIRD').doc(id).set(JSON.parse(jsonString)).then(() => {
                console.log("Document successfully written!");
                this.transSubscription.unsubscribe();
            });
        });
    }

    updateBird(bird: BirdModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            bird.lastModifiedBy = usr.email;
            this.birdDoc = this.afs.doc<BirdModel>(`${this.BIRD}/${bird.id}`);
            this.birdDoc.update(bird);
            this.transSubscription.unsubscribe();
        });
    }

    updateVersion(version: VersionModel): void {
        this.transSubscription = this.afsAuth.user.subscribe(usr => {
            version.lastModifiedBy = usr.email;
            this.hotspotDoc = this.afs.doc<VersionModel>(`${this.VERSION}/${version.id}`);
            this.hotspotDoc.update(version);
            this.transSubscription.unsubscribe();
        });
    }

    getHotspotByLocation(latitude: string, longitude: string) {
        this.hotspotCol = this.afs.collection<HotspotModel>(this.HOTSPOT, ref =>
            ref.where('location.latitude', '==', latitude)
                .where('location.longitude', '==', longitude)
        );
        return this.hotspotCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as HotspotModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getBirdsByScientificName(scientificName: string) {
        this.birdsCol = this.afs.collection<BirdModel>(this.BIRD, ref => ref.where('esInfo.scientificName', '==', scientificName));
        return this.birdsCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as BirdModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    getFamiliesByScientificName(scientificName: string) {
        this.familiesCol = this.afs.collection<FamilyModel>(this.FAMILIES, ref => ref.where('scientificName', '==', scientificName));
        return this.familiesCol.snapshotChanges()
            .pipe(map(changes => {
                return changes.map(action => {
                    const data = action.payload.doc.data() as FamilyModel;
                    data.id = action.payload.doc.id;
                    return data;
                })
            }))
    }

    deleteHotspot(hotspot: HotspotModel): Promise<any> {
        return new Promise((resolve) => {
            let menuImagePath = `${Constants.HOTSPOT_FOLDER_NAME}/${hotspot.imageName}.${hotspot.ext}`;
            console.log('menuImagePath', menuImagePath)
            // Borro archivo
            let ref = this.storage.ref(menuImagePath);
            ref.delete().subscribe(() => {
                // Borro documento
                this.afs.collection(this.HOTSPOT).doc(hotspot.id).delete().then(() => {
                    console.log("Document successfully deleted!");
                    resolve(null);
                });
            })
        });
    }

    deleteRoute(trail: TrailModel): Promise<any> {
        return new Promise((resolve) => {
            let menuImagePath = `${Constants.ROUTES_FOLDER_NAME}/${trail.imageName}.${trail.ext}`;
            // Borro archivo
            let ref = this.storage.ref(menuImagePath);
            ref.delete().subscribe(() => {
                // Borro documento
                this.afs.collection(this.ROUTE).doc(trail.id).delete().then(() => {
                    console.log("Document successfully deleted!");
                    resolve(null);
                });
            })
        });
    }

    deleteBird(bird: BirdModel): Promise<any> {
        return new Promise((resolve) => {
            this.deleteImages(bird.imageGallery, 0).then(() => {
                console.log('ACABA DE BORRAR IMAGENES');
                this.deleteVideos(bird.videoGallery, 0).then(() => {
                    console.log('ACABA DE BORRAR VIDEOS');
                    this.deleteSounds(bird.soundGallery, 0).then(() => {
                        console.log('ACABA DE BORRAR SONIDOS');
                        // Borro documento
                        this.afs.collection(this.BIRD).doc(bird.id).delete().then(() => {
                            console.log("Document successfully deleted!");
                            resolve(null);
                        });
                    })
                })
            })
        });
    }

    deleteImages(imageCol: ImageInfo[], index: number): Promise<any> {
        return new Promise((resolve) => {
            if(imageCol == undefined) {
                resolve(null);
            } else if (index < imageCol.length) {
                let imagePath = `${Constants.BIRDS_FOLDER_NAME}/${imageCol[index].imageName}.${imageCol[index].ext}`;
                // Borro archivo
                let ref = this.storage.ref(imagePath);
                ref.delete().subscribe(() => {
                    let thumbnailPath = `${Constants.BIRDS_FOLDER_NAME}/${imageCol[index].thumbnail}.${imageCol[index].thumbnailExt}`;
                    //Borro thumbnail
                    let thumbnailRef = this.storage.ref(thumbnailPath);
                    thumbnailRef.delete().subscribe(() => {
                        resolve(this.deleteImages(imageCol, index + 1));
                    });
                });
            } else {
                resolve(null);
            }
        });
    }

    deleteVideos(videoCol: VideoInfo[], index: number): Promise<any> {
        return new Promise((resolve) => {
            if(videoCol == undefined) {
                resolve(null);
            } else if (index < videoCol.length) {
                let videoPath = `${Constants.BIRDS_FOLDER_NAME}/${videoCol[index].videoName}.${videoCol[index].ext}`;
                // Borro archivo
                let ref = this.storage.ref(videoPath);
                ref.delete().subscribe(() => {
                    let thumbnailPath = `${Constants.BIRDS_FOLDER_NAME}/${videoCol[index].thumbnail}.${videoCol[index].thumbnailExt}`;
                    //Borro thumbnail
                    let thumbnailRef = this.storage.ref(thumbnailPath);
                    thumbnailRef.delete().subscribe(() => {
                        resolve(this.deleteVideos(videoCol, index + 1));
                    });
                });
            } else {
                resolve(null);
            }
        });
    }

    deleteSounds(soundCol: SoundInfo[], index: number): Promise<any> {
        return new Promise((resolve) => {
            if(soundCol == undefined) {
                resolve(null);
            } else if (index < soundCol.length) {
                let soundPath = `${Constants.SOUNDS_FOLDER_NAME}/${soundCol[index].clipName}.${soundCol[index].ext}`;
                // Borro archivo
                let ref = this.storage.ref(soundPath);
                ref.delete().subscribe(() => {
                    // Imagen borrada
                    resolve(this.deleteSounds(soundCol, index + 1));
                });
            } else {
                resolve(null);
            }
        });
    }

}
