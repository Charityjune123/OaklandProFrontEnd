import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Walkthroughs } from './walkthroughs';

describe('Walkthroughs', () => {
  let component: Walkthroughs;
  let fixture: ComponentFixture<Walkthroughs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Walkthroughs],
    }).compileComponents();

    fixture = TestBed.createComponent(Walkthroughs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
