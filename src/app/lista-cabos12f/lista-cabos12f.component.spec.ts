import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCabos12fComponent } from './lista-cabos12f.component';

describe('ListaCabos12fComponent', () => {
  let component: ListaCabos12fComponent;
  let fixture: ComponentFixture<ListaCabos12fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCabos12fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCabos12fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
