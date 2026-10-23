import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortal } from './admin-portal';

describe('AdminPortal', () => {
  let component: AdminPortal;
  let fixture: ComponentFixture<AdminPortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPortal],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
