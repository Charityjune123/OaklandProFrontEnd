import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LeadService, CommercialLead } from '../../services/lead';
import { WalkthroughService } from '../../services/walkthrough';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  leads: CommercialLead[] = [];
  loading = true;
  errorMessage = '';

  selectedLeadId: number | null = null;
  walkthroughDate = '';
  walkthroughTime = '';
  walkthroughMessage = '';

  editLead(lead: any) {
    console.log('Editing lead:', lead);
  }

  constructor(
    private leadService: LeadService,
    private walkthroughService: WalkthroughService
  ) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading = true;
    this.leadService.getAllLeads().subscribe({
      next: (data: CommercialLead[]) => {
        this.leads = data;
        this.loading = false;
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Error fetching leads', err);
        this.errorMessage = 'Could not load leads from backend. Ensure Spring Boot is running.';
        this.loading = false;
      }
    });
  }

  selectLeadForWalkthrough(leadId: number): void {
    this.selectedLeadId = leadId;
    this.walkthroughDate = '';
    this.walkthroughTime = '';
    this.walkthroughMessage = '';
  }

  cancelWalkthrough(): void {
    this.selectedLeadId = null;
    this.walkthroughDate = '';
    this.walkthroughTime = '';
    this.walkthroughMessage = '';
  }

  scheduleWalkthrough(): void {
    if (this.selectedLeadId === null || !this.walkthroughDate || !this.walkthroughTime) {
      this.walkthroughMessage = 'Please select a date and time.';
      return;
    }

    const scheduledDate = `${this.walkthroughDate}T${this.walkthroughTime}`;

    const walkthrough = {
      leadId: this.selectedLeadId,
      scheduledDate: scheduledDate,
      status: 'SCHEDULED',
      notes: ''
    };

    console.log('Sending walkthrough payload:', walkthrough);

    this.walkthroughService.createWalkthrough(walkthrough).subscribe({
      next: () => {
        this.walkthroughMessage = 'Walkthrough scheduled successfully!';
        this.selectedLeadId = null;
        this.walkthroughDate = '';
        this.walkthroughTime = '';
        this.loadLeads();
      },
      error: (err: any) => {
        console.error('Error scheduling walkthrough', err);
        this.walkthroughMessage = 'Could not schedule walkthrough. Check console for details.';
      }
    });
  }

  deleteLead(leadId: number): void {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    this.leadService.deleteLead(leadId).subscribe({
      next: () => {
        this.leads = this.leads.filter(lead => lead.id !== leadId);
        this.walkthroughMessage = 'Lead deleted successfully.';
      },
      error: (err: any) => {
        console.error('Error deleting lead', err);
        this.errorMessage = 'Could not delete lead.';
      }
    });
  }
}