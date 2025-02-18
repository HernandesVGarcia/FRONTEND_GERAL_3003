import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCabos24fComponent } from './lista-cabos24f.component';

describe('ListaCabos24fComponent', () => {
  let component: ListaCabos24fComponent;
  let fixture: ComponentFixture<ListaCabos24fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCabos24fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCabos24fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
