import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { paths } from './constants/paths';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { NewPostComponent } from './pages/new-post/new-post.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PostComponent } from './pages/post/post.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TagsComponent } from './pages/tags/tags.component';

const routes: Routes = [
  { path: paths.home, component: HomeComponent },
  { path: paths.login, component: LoginComponent },
  { path: paths.post + '/:id', component: PostComponent },
  { path: paths.newPost, component: NewPostComponent },
  { path: paths.profile + '/:id', component: ProfileComponent },
  { path: paths.tags + '/:id', component: TagsComponent },
  { path: paths.settings, component: SettingsComponent },
  // make sure leave this last in the list because appearently the order here matters
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
