import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-portal.html',
  styleUrls: ['./admin-portal.css']
})
export class AdminPortalComponent {
  @Output() openLeads = new EventEmitter<void>();
  @Output() openWalkthroughs = new EventEmitter<void>();
  @Output() openCustomers = new EventEmitter<void>();
  @Output() openCampaignManager = new EventEmitter<void>();

  viewLeads(): void {
    this.openLeads.emit();
  }

  viewWalkthroughs(): void {
    this.openWalkthroughs.emit();
  }

  viewCustomers(): void {
    this.openCustomers.emit();
  }

  viewCampaignManager(): void {
    this.openCampaignManager.emit();
  }
}