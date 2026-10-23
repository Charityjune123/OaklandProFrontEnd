import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteForm } from './quote-form';

describe('QuoteForm', () => {
  let component: QuoteForm;
  let fixture: ComponentFixture<QuoteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteForm],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
