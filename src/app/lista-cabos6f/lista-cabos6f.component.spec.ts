import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCabos6fComponent } from './lista-cabos6f.component';

describe('ListaCabos6fComponent', () => {
  let component: ListaCabos6fComponent;
  let fixture: ComponentFixture<ListaCabos6fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCabos6fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCabos6fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
