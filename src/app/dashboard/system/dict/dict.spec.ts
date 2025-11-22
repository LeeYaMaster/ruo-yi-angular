import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dict } from './dict';

describe('Dict', () => {
  let component: Dict;
  let fixture: ComponentFixture<Dict>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dict]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dict);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
