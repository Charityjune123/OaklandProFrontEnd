import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, Contract, Invoice } from '../services/customer';

const SERVER_HELP =
  'Check that Spring Boot is running on port 8080 and that CORS allows http://localhost:4200.';

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: 'Every day',
  WEEKLY: 'Every week',
  'BI-WEEKLY': 'Every 2 weeks',
  MONTHLY: 'Every month'
};

@Component({
  selector: 'app-customerdashboard',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './customerdashboard.html',
  styleUrls: ['./customerdashboard.css']
})
export class CustomerDashboardComponent implements OnInit {
  private api = inject(CustomerService);

  customers = signal<Customer[]>([]);
  invoices = signal<Invoice[]>([]);
  allContracts = signal<Contract[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  search = signal('');
  error = signal('');
  notesSaved = signal(false);

  showAddModal = signal(false);
  showContractModal = signal(false);
  showInvoiceModal = signal(false);

  today = this.daysFromToday(0);
  notesDraft = '';

  contracts = computed(() => {
    const id = this.selectedCustomer()?.id;
    return id ? this.allContracts().filter((c) => c.customerId === id) : [];
  });

  // Active contracts due in the next 7 days, plus any that are overdue.
  weekVisits = computed(() => {
    const limit = this.daysFromToday(7);
    const byId = new Map(this.customers().map((c) => [c.id, c]));
    return this.allContracts()
      .filter((c) => c.status === 'ACTIVE' && c.nextCleanDate && c.nextCleanDate <= limit)
      .sort((a, b) => a.nextCleanDate.localeCompare(b.nextCleanDate))
      .flatMap((contract) => {
        const customer = byId.get(contract.customerId);
        return customer ? [{ contract, customer }] : [];
      });
  });

  filteredCustomers = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.customers();
    return this.customers().filter((c) =>
      [c.companyName, c.contactName, c.email, c.address].some((v) => v?.toLowerCase().includes(q))
    );
  });

  unpaidInvoices = computed(() => this.invoices().filter((i) => i.status !== 'PAID'));
  unpaidTotal = computed(() => this.unpaidInvoices().reduce((sum, i) => sum + i.amount, 0));

  customerInvoices = computed(() => {
    const contractIds = new Set(this.contracts().map((c) => c.id));
    return this.invoices().filter((i) => contractIds.has(i.contractId));
  });

  newCustomer: Customer = this.blankCustomer();
  newContract: Contract = this.blankContract();
  newInvoice: Invoice = this.blankInvoice();

  ngOnInit(): void {
    this.loadCustomers();
    this.loadContracts();
    this.loadInvoices();
  }

  // ---------- Loading ----------

  loadCustomers(): void {
    this.api.getCustomers().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.error.set('');
      },
      error: () => this.error.set(`Couldn't load customers. ${SERVER_HELP}`)
    });
  }

  loadContracts(): void {
    this.api.getAllContracts().subscribe({
      next: (data) => this.allContracts.set(data),
      error: () => this.error.set(`Couldn't load contracts. ${SERVER_HELP}`)
    });
  }

  loadInvoices(): void {
    this.api.getAllInvoices().subscribe({
      next: (data) => this.invoices.set(data),
      error: () => this.error.set(`Couldn't load invoices. ${SERVER_HELP}`)
    });
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.notesDraft = customer.notes ?? '';
    this.notesSaved.set(false);
  }

  closeDetails(): void {
    this.selectedCustomer.set(null);
  }

  // ---------- Customers ----------

  saveCustomer(): void {
    this.api.addCustomer(this.newCustomer).subscribe({
      next: () => {
        this.loadCustomers();
        this.showAddModal.set(false);
        this.newCustomer = this.blankCustomer();
      },
      error: () => this.error.set(`Couldn't save the customer. ${SERVER_HELP}`)
    });
  }

  saveNotes(): void {
    const customer = this.selectedCustomer();
    if (!customer?.id) return;
    this.api.updateCustomer(customer.id, { ...customer, notes: this.notesDraft }).subscribe({
      next: (saved) => {
        this.selectedCustomer.set(saved);
        this.loadCustomers();
        this.notesSaved.set(true);
        setTimeout(() => this.notesSaved.set(false), 2000);
      },
      error: () => this.error.set(`Couldn't save the notes. ${SERVER_HELP}`)
    });
  }

  deleteCustomer(id?: number): void {
    if (!id || !confirm('Delete this client?')) return;
    this.api.deleteCustomer(id).subscribe({
      next: () => {
        this.loadCustomers();
        if (this.selectedCustomer()?.id === id) this.closeDetails();
      },
      error: () => this.error.set(`Couldn't delete the client. ${SERVER_HELP}`)
    });
  }

  // ---------- Contracts and visits ----------

  saveContract(): void {
    const customer = this.selectedCustomer();
    if (!customer?.id) return;
    this.newContract.customerId = customer.id;
    // The first clean happens on the start date.
    this.newContract.nextCleanDate = this.newContract.startDate;
    this.api.createContract(this.newContract).subscribe({
      next: () => {
        this.loadContracts();
        this.showContractModal.set(false);
        this.newContract = this.blankContract();
      },
      error: () => this.error.set(`Couldn't save the contract. ${SERVER_HELP}`)
    });
  }

  markDone(contract: Contract): void {
    if (!contract.id) return;
    this.api.completeContract(contract.id).subscribe({
      next: () => this.loadContracts(),
      error: () => this.error.set(`Couldn't mark that clean as done. ${SERVER_HELP}`)
    });
  }

  assign(contract: Contract, who: string): void {
    if (!contract.id) return;
    this.api.updateContract(contract.id, { assignedTo: who }).subscribe({
      next: () => this.loadContracts(),
      error: () => this.error.set(`Couldn't change who cleans this site. ${SERVER_HELP}`)
    });
  }

  // ---------- Invoices ----------

  openInvoiceModal(contract: Contract): void {
    this.newInvoice = {
      contractId: contract.id!,
      amount: contract.agreedAmount,
      dueDate: this.daysFromToday(14),
      status: 'UNPAID'
    };
    this.showInvoiceModal.set(true);
  }

  saveInvoice(): void {
    this.api.createInvoice(this.newInvoice).subscribe({
      next: () => {
        this.loadInvoices();
        this.showInvoiceModal.set(false);
      },
      error: () => this.error.set(`Couldn't create the invoice. ${SERVER_HELP}`)
    });
  }

  // ---------- Helpers ----------

  frequencyLabel(value: string): string {
    return FREQUENCY_LABELS[value] ?? value;
  }

  contractLabel(contractId: number): string {
    return this.contracts().find((c) => c.id === contractId)?.facilityType ?? `Contract #${contractId}`;
  }

  // Uses the computer's local date, not UTC, so evenings don't roll over to tomorrow.
  private daysFromToday(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private blankCustomer(): Customer {
    return { companyName: '', contactName: '', email: '', phone: '', address: '' };
  }

  private blankContract(): Contract {
    return {
      customerId: 0,
      facilityType: '',
      squareFootage: 0,
      frequency: 'WEEKLY',
      agreedAmount: 0,
      startDate: this.daysFromToday(0),
      nextCleanDate: '',
      assignedTo: 'OWNER',
      status: 'ACTIVE'
    };
  }

  private blankInvoice(): Invoice {
    return { contractId: 0, amount: 0, dueDate: '', status: 'UNPAID' };
  }
}