import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCtosComponent } from './lista-ctos.component';

describe('ListaCtosComponent', () => {
  let component: ListaCtosComponent;
  let fixture: ComponentFixture<ListaCtosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCtosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCtosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
