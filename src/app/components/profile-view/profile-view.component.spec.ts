import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeagoModule } from 'ngx-timeago';
import { ProfileViewComponent } from './profile-view.component';

describe('ProfileViewComponent', () => {
  let component: ProfileViewComponent;
  let fixture: ComponentFixture<ProfileViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileViewComponent],
      imports: [TimeagoModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
