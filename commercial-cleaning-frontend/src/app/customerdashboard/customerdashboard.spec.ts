import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Customerdashboard } from './customerdashboard';

describe('Customerdashboard', () => {
  let component: Customerdashboard;
  let fixture: ComponentFixture<Customerdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customerdashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Customerdashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
