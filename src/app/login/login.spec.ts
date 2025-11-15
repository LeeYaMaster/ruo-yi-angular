import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Login ]
    })
    .compileComponents();
    ;

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
