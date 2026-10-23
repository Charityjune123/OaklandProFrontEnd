import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalkthroughService, Walkthrough } from '../services/walkthrough';
import { CustomerService } from '../services/customer';

type Filter = 'scheduled' | 'completed' | 'all';

const SERVER_HELP =
  'Check that Spring Boot is running on port 8080 and that CORS allows http://localhost:4200.';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
  CANCELLED: 'Cancelled',
  CONVERTED: 'Now a client'
};

const FACILITY_LABELS: Record<string, string> = {
  Office: 'Corporate office',
  Medical: 'Medical or dental clinic',
  Industrial: 'Industrial or warehouse',
  Retail: 'Retail store'
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Every day',
  WEEKLY: 'Every week',
  BI_WEEKLY: 'Every 2 weeks',
  'BI-WEEKLY': 'Every 2 weeks',
  MONTHLY: 'Every month'
};

@Component({
  selector: 'app-walkthroughs',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './walkthroughs.html',
  styleUrls: ['./walkthroughs.css']
})
export class WalkthroughsComponent implements OnInit {
  private api = inject(WalkthroughService);
  private customerApi = inject(CustomerService);

  walkthroughs = signal<Walkthrough[]>([]);
  loading = signal(true);
  error = signal('');
  filter = signal<Filter>('scheduled');
  savedId = signal<number | null>(null);

  today = this.daysFromToday(0);
  drafts: Record<number, string> = {};

  counts = computed(() => {
    const list = this.walkthroughs();
    return {
      scheduled: list.filter((w) => w.status === 'SCHEDULED').length,
      completed: list.filter((w) => w.status === 'COMPLETED').length,
      all: list.length
    };
  });

  visible = computed(() => {
    const f = this.filter();
    const list = this.walkthroughs().filter((w) =>
      f === 'all' ? true : f === 'scheduled' ? w.status === 'SCHEDULED' : w.status === 'COMPLETED'
    );
    // Soonest first for upcoming work, newest first for everything else.
    const dir = f === 'scheduled' ? 1 : -1;
    return [...list].sort((a, b) => dir * (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''));
  });

  // Reschedule modal
  rescheduleTarget = signal<Walkthrough | null>(null);
  rescheduleValue = '';

  // Convert modal
  convertTarget = signal<Walkthrough | null>(null);
  convertError = signal('');
  convertForm = {
    address: '',
    facilityType: '',
    squareFootage: 0,
    frequency: 'WEEKLY',
    agreedAmount: 0,
    startDate: '',
    assignedTo: 'OWNER'
  };
  private createdCustomerId: number | null = null;

  ngOnInit(): void {
    this.loadWalkthroughs();
  }

  loadWalkthroughs(): void {
    this.api.getAllWalkthroughs().subscribe({
      next: (data) => {
        this.walkthroughs.set(data);
        for (const w of data) {
          if (w.id) this.drafts[w.id] = w.notes ?? '';
        }
        this.loading.set(false);
        this.error.set('');
      },
      error: () => {
        this.error.set(`Couldn't load walkthroughs. ${SERVER_HELP}`);
        this.loading.set(false);
      }
    });
  }

  // ---------- Status and notes ----------

  setStatus(w: Walkthrough, status: string): void {
    if (!w.id) return;
    if (status === 'CANCELLED' && !confirm('Cancel this walkthrough?')) return;
    this.api.updateWalkthrough(w.id, { status }).subscribe({
      next: () => this.loadWalkthroughs(),
      error: () => this.error.set(`Couldn't update the walkthrough. ${SERVER_HELP}`)
    });
  }

  draftFor(w: Walkthrough): string {
    return w.id ? (this.drafts[w.id] ?? '') : '';
  }

  setDraft(w: Walkthrough, value: string): void {
    if (w.id) this.drafts[w.id] = value;
  }

  saveNotes(w: Walkthrough): void {
    if (!w.id) return;
    this.api.updateWalkthrough(w.id, { notes: this.drafts[w.id] ?? '' }).subscribe({
      next: () => {
        this.savedId.set(w.id!);
        setTimeout(() => this.savedId.set(null), 2000);
        this.loadWalkthroughs();
      },
      error: () => this.error.set(`Couldn't save the notes. ${SERVER_HELP}`)
    });
  }

  // ---------- Reschedule ----------

  openReschedule(w: Walkthrough): void {
    this.rescheduleValue = (w.scheduledDate ?? '').slice(0, 16);
    this.rescheduleTarget.set(w);
  }

  saveReschedule(): void {
    const w = this.rescheduleTarget();
    if (!w?.id || !this.rescheduleValue) return;
    this.api
      .updateWalkthrough(w.id, { scheduledDate: `${this.rescheduleValue}:00`, status: 'SCHEDULED' })
      .subscribe({
        next: () => {
          this.rescheduleTarget.set(null);
          this.loadWalkthroughs();
        },
        error: () => this.error.set(`Couldn't reschedule. ${SERVER_HELP}`)
      });
  }

  // ---------- Convert to client ----------

  openConvert(w: Walkthrough): void {
    const lead = w.lead;
    if (!lead) return;
    const min = lead.estimatedPriceMin ?? 0;
    const max = lead.estimatedPriceMax ?? 0;
    const requested = lead.requestedStartDate ?? '';
    this.createdCustomerId = null;
    this.convertError.set('');
    this.convertForm = {
      address: '',
      facilityType: this.facilityLabel(lead.facilityType),
      squareFootage: lead.squareFootage,
      frequency: this.normalizeFrequency(lead.cleaningFrequency),
      agreedAmount: Math.round((min + max) / 2),
      startDate: requested >= this.today ? requested : this.today,
      assignedTo: 'OWNER'
    };
    this.convertTarget.set(w);
  }

  closeConvert(): void {
    this.convertTarget.set(null);
    this.createdCustomerId = null;
  }

  confirmConvert(): void {
    const w = this.convertTarget();
    const lead = w?.lead;
    if (!w?.id || !lead) return;
    const f = this.convertForm;

    if (!f.address.trim()) {
      this.convertError.set('Enter the service address.');
      return;
    }
    if (!f.startDate) {
      this.convertError.set('Choose the first clean date.');
      return;
    }
    this.convertError.set('');

    const createContract = (customerId: number) => {
      this.customerApi
        .createContract({
          customerId,
          facilityType: f.facilityType,
          squareFootage: Number(f.squareFootage),
          frequency: f.frequency,
          agreedAmount: Number(f.agreedAmount),
          startDate: f.startDate,
          nextCleanDate: f.startDate,
          assignedTo: f.assignedTo,
          status: 'ACTIVE'
        })
        .subscribe({
          next: () => {
            this.api.updateWalkthrough(w.id!, { status: 'CONVERTED' }).subscribe({
              next: () => {
                this.closeConvert();
                this.loadWalkthroughs();
              },
              error: () => this.convertError.set(`Client and contract saved, but the status didn't update. ${SERVER_HELP}`)
            });
          },
          error: () => this.convertError.set(`Couldn't save the contract. ${SERVER_HELP}`)
        });
    };

    // If a retry follows a failed contract save, reuse the client that was already created.
    if (this.createdCustomerId) {
      createContract(this.createdCustomerId);
      return;
    }

    this.customerApi
      .addCustomer({
        leadId: w.leadId,
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        address: f.address.trim(),
        notes: w.notes ?? ''
      })
      .subscribe({
        next: (customer) => {
          this.createdCustomerId = customer.id ?? null;
          if (customer.id) createContract(customer.id);
        },
        error: () => this.convertError.set(`Couldn't save the client. ${SERVER_HELP}`)
      });
  }

  // ---------- Helpers ----------

  statusLabel(status?: string): string {
    return STATUS_LABELS[status ?? 'SCHEDULED'] ?? (status ?? '');
  }

  facilityLabel(value?: string): string {
    return (value && FACILITY_LABELS[value]) || value || '';
  }

  frequencyLabel(value?: string): string {
    return (value && FREQUENCY_LABELS[value]) || value || '';
  }

  dayFlag(w: Walkthrough): 'late' | 'today' | '' {
    if (w.status !== 'SCHEDULED' || !w.scheduledDate) return '';
    const day = w.scheduledDate.slice(0, 10);
    return day < this.today ? 'late' : day === this.today ? 'today' : '';
  }

  private normalizeFrequency(value?: string): string {
    const v = (value ?? 'WEEKLY').replace('_', '-');
    return ['DAILY', 'WEEKLY', 'BI-WEEKLY', 'MONTHLY'].includes(v) ? v : 'WEEKLY';
  }

  // Uses the computer's local date, not UTC.
  private daysFromToday(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}