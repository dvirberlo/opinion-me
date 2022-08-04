import { ComponentFixture, TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { environment } from 'src/environments/environment';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        MatSnackBarModule,
        MatMenuModule,
        AppRoutingModule,
      ],
      declarations: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toolbar title', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector(
      '#header'
    ) as HTMLElement;
    expect(toolbar?.textContent).toContain('Opinion Me');
  });

  it('should by primary background color', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector(
      '#header'
    ) as HTMLElement;
    expect(toolbar.attributes.getNamedItem('color')?.value).toBe('primary');
  });
});
