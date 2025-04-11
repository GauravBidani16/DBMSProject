import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsAddComponent } from './vitals-add.component';

describe('VitalsAddComponent', () => {
  let component: VitalsAddComponent;
  let fixture: ComponentFixture<VitalsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalsAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
