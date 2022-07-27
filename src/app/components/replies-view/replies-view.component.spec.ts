import { ComponentFixture, TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { environment } from 'src/environments/environment';
import { ReplisViewComponent } from './replies-view.component';

describe('ReplisViewComponent', () => {
  let component: ReplisViewComponent;
  let fixture: ComponentFixture<ReplisViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplisViewComponent],
      imports: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        MatSnackBarModule,
        AppRoutingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplisViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
