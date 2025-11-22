import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cache } from './cache';

describe('Cache', () => {
  let component: Cache;
  let fixture: ComponentFixture<Cache>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cache]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cache);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
