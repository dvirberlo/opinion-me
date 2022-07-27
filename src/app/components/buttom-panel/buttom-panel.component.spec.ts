import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtomPanelComponent } from './buttom-panel.component';

describe('ButtomPanelComponent', () => {
  let component: ButtomPanelComponent;
  let fixture: ComponentFixture<ButtomPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtomPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtomPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
