import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiberMapComponent } from './fiber-map.component';

describe('FiberMapComponent', () => {
  let component: FiberMapComponent;
  let fixture: ComponentFixture<FiberMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiberMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiberMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
