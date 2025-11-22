import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CacheList } from './cache-list';

describe('CacheList', () => {
  let component: CacheList;
  let fixture: ComponentFixture<CacheList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CacheList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CacheList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
