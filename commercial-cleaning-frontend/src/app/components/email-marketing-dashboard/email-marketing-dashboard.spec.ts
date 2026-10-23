import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailMarketingDashboard } from './email-marketing-dashboard';

describe('EmailMarketingDashboard', () => {
  let component: EmailMarketingDashboard;
  let fixture: ComponentFixture<EmailMarketingDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailMarketingDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailMarketingDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
