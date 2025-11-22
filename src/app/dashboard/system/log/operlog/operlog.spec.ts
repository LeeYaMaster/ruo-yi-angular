import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Operlog } from './operlog';

describe('Operlog', () => {
  let component: Operlog;
  let fixture: ComponentFixture<Operlog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Operlog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Operlog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
