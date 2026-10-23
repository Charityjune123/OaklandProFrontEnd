import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService, CommercialLead } from '../../services/lead';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-form.html',
  styleUrls: ['./quote-form.css']
})
export class QuoteFormComponent {
  currentStep = 1;

  lead: CommercialLead = {
    facilityType: 'Office',
    squareFootage: 1000,
    cleaningFrequency: 'WEEKLY',
    estimatedPriceMin: 0,
    estimatedPriceMax: 0,
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    requestedStartDate: new Date().toISOString().split('T')[0]
  };

  submitted = false;
  errorMessage = '';

  constructor(private leadService: LeadService) {}

  get baseEstimatedCost(): number {
    const sqft = this.lead.squareFootage || 0;
    let rate = 0.15;

    if (this.lead.cleaningFrequency === 'DAILY') rate = 0.10;
    if (this.lead.cleaningFrequency === 'BI_WEEKLY') rate = 0.18;
    if (this.lead.cleaningFrequency === 'MONTHLY') rate = 0.22;

    let multiplier = 4;
    if (this.lead.cleaningFrequency === 'DAILY') multiplier = 20;
    if (this.lead.cleaningFrequency === 'BI_WEEKLY') multiplier = 2;
    if (this.lead.cleaningFrequency === 'MONTHLY') multiplier = 1;

    return Math.round(sqft * rate * multiplier);
  }

  get estimatedPriceMin(): number {
    return Math.round(this.baseEstimatedCost * 0.9);
  }

  get estimatedPriceMax(): number {
    return Math.round(this.baseEstimatedCost * 1.15);
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit() {
    this.lead.estimatedPriceMin = this.estimatedPriceMin;
    this.lead.estimatedPriceMax = this.estimatedPriceMax;

    this.leadService.submitLead(this.lead).subscribe({
      next: (response: any) => {
        this.submitted = true;
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.log("Error submitting lead", err);
        this.errorMessage = 'Failed to submit quote request. Check backend logs.';
      }
    });
  }
}