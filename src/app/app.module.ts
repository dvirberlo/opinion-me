import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  enableIndexedDbPersistence,
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TimeagoModule } from 'ngx-timeago';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtomPanelComponent } from './components/buttom-panel/buttom-panel.component';
import { HeaderComponent } from './components/header/header.component';
import { PostViewComponent } from './components/post-view/post-view.component';
import { ReplisViewComponent } from './components/replies-view/replies-view.component';
import { ReplyDialogComponent } from './components/reply-dialog/reply-dialog.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { MaterialModule } from './material.module';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { NewPostComponent } from './pages/new-post/new-post.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PostComponent } from './pages/post/post.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TagsComponent } from './pages/tags/tags.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SnackbarComponent,
    ButtomPanelComponent,
    HomeComponent,
    PageNotFoundComponent,
    LoginComponent,
    PostComponent,
    PostViewComponent,
    ReplyDialogComponent,
    ReplisViewComponent,
    NewPostComponent,
    ProfileComponent,
    TagsComponent,
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      auth.useDeviceLanguage();
      return auth;
    }),
    provideFirestore(() => {
      const app = getFirestore();
      enableIndexedDbPersistence(app);
      return app;
    }),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    FlexLayoutModule,
    TimeagoModule.forRoot(),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
