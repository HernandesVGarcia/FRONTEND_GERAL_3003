import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarsComponent } from './toolbars.component';

describe('ToolbarsComponent', () => {
  let component: ToolbarsComponent;
  let fixture: ComponentFixture<ToolbarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
