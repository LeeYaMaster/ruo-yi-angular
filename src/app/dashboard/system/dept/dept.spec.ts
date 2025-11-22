import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dept } from './dept';

describe('Dept', () => {
  let component: Dept;
  let fixture: ComponentFixture<Dept>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dept]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dept);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
