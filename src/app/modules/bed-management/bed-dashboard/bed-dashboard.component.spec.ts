import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedDashboardComponent } from './bed-dashboard.component';

describe('BedDashboardComponent', () => {
  let component: BedDashboardComponent;
  let fixture: ComponentFixture<BedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
