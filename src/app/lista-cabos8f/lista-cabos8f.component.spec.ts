import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCabos8fComponent } from './lista-cabos8f.component';

describe('ListaCabos8fComponent', () => {
  let component: ListaCabos8fComponent;
  let fixture: ComponentFixture<ListaCabos8fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCabos8fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCabos8fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
