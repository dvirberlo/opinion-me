import { ComponentFixture, TestBed } from '@angular/core/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { environment } from 'src/environments/environment';

import { ButtomPanelComponent } from './buttom-panel.component';

describe('ButtomPanelComponent', () => {
  let component: ButtomPanelComponent;
  let fixture: ComponentFixture<ButtomPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtomPanelComponent],
      imports: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        AppRoutingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtomPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
