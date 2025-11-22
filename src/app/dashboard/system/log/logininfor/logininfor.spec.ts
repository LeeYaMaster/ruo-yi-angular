import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logininfor } from './logininfor';

describe('Logininfor', () => {
  let component: Logininfor;
  let fixture: ComponentFixture<Logininfor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logininfor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Logininfor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
