import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCabosComponent } from './lista-cabos.component';

describe('ListaCabosComponent', () => {
  let component: ListaCabosComponent;
  let fixture: ComponentFixture<ListaCabosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCabosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCabosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
