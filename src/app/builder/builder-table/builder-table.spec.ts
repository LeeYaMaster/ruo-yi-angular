import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderTable } from './builder-table';

describe('BuilderTable', () => {
  let component: BuilderTable;
  let fixture: ComponentFixture<BuilderTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuilderTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
