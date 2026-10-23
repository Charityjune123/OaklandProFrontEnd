import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Tab = 'overview' | 'templates' | 'audience' | 'campaigns';

interface Subscriber { id: number; email: string; source: string; tag: string | null; status: string; createdAt: string; }
interface Campaign { id: number; subject: string; sentCount: number; createdAt: string; }
interface CsvPreview { fileName: string; valid: number; duplicates: number; invalid: number; }
interface EmailTemplate { name: string; description: string; icon: string; color: string; subject: string; html: string; }

const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const TEMPLATE_KEY = 'campaignTemplates';

@Component({
  selector: 'app-email-marketing-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-marketing-dashboard.html',
  styleUrls: ['./email-marketing-dashboard.css']
})
export class EmailMarketingDashboardComponent implements OnInit {

  // Match whatever base URL your other services use
  private api = 'https://oaklandprobackend.onrender.com/api';

  tab: Tab = 'overview';
  showComposer = false;

  // Campaign composer
  campaign = { subject: '', senderEmail: '', htmlContent: '' };
  isSending = false;
  responseMessage = '';
  isSuccess = false;

  // Data
  subscribers: Subscriber[] = [];
  campaigns: Campaign[] = [];

  // Import tools
  newEmail = '';
  selectedFile: File | null = null;
  csvPreview: CsvPreview | null = null;
  consentConfirmed = false;
  importTag = '';
  dragging = false;
  subscriberMessage = '';
  subscriberSuccess = false;

  // Contacts table
  search = '';
  statusFilter = 'all';
  tagFilter = 'all';
  page = 1;
  pageSize = 50;

  blankTemplate: EmailTemplate = {
    name: 'Blank', description: 'Write your own', icon: '+', color: 'gray', subject: '', html: ''
  };

  builtInTemplates: EmailTemplate[] = [
    {
      name: 'New customer offer',
      description: 'Free walkthrough for new businesses',
      icon: '', color: 'blue',
      subject: 'A free walkthrough for your workspace',
      html: '<h2>Let us take cleaning off your list</h2>'
          + '<p>Oakland Pro Cleaning Services offers dependable commercial cleaning across Oakland County.</p>'
          + '<p>Book a free walkthrough and get a custom quote for your space.</p>'
          + '<p><a href="https://example.com/quote">Get my free quote</a></p>'
    },
    {
      name: 'Seasonal deep clean',
      description: 'Spring, fall, and holiday specials',
      icon: '', color: 'green',
      subject: 'Get your office ready for the season',
      html: '<h2>Seasonal deep clean</h2>'
          + '<p>Carpets, windows, floors, and restrooms, done thoroughly while your team is away.</p>'
          + '<p><a href="https://example.com/quote">Schedule a deep clean</a></p>'
    },
    {
      name: 'Thank you',
      description: 'Check in with current clients',
      icon: '', color: 'amber',
      subject: 'Thank you for trusting us',
      html: '<h2>Thank you</h2>'
          + '<p>We appreciate your business. If there is anything we can do better, reply to this email and tell us.</p>'
    }
  ];

  customTemplates: EmailTemplate[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCustomTemplates();
    this.loadSubscribers();
    this.loadCampaigns();
  }

  get allTemplates(): EmailTemplate[] {
    return [...this.builtInTemplates, ...this.customTemplates];
  }

  // ---------- Stats ----------
  get activeCount(): number { return this.countStatus('active'); }
  get pendingCount(): number { return this.countStatus('pending'); }
  get bouncedCount(): number { return this.countStatus('bounced'); }
  get unsubscribedCount(): number { return this.countStatus('unsubscribed'); }

  get bounceRate(): string { return this.percent(this.bouncedCount); }
  get unsubscribeRate(): string { return this.percent(this.unsubscribedCount); }

  get sentThisMonth(): number {
    const now = new Date();
    return this.campaigns
      .filter(c => {
        const d = new Date(c.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, c) => sum + (c.sentCount || 0), 0);
  }

  private countStatus(status: string): number {
    return this.subscribers.filter(s => s.status === status).length;
  }

  private percent(count: number): string {
    if (!this.subscribers.length) return '0%';
    return (Math.round((count / this.subscribers.length) * 1000) / 10) + '%';
  }

  get tags(): string[] {
    const set = new Set<string>();
    this.subscribers.forEach(s => { if (s.tag) set.add(s.tag); });
    return Array.from(set).sort();
  }

  // ---------- Navigation ----------
  goTo(tab: Tab, sectionId: string): void {
    this.tab = tab;
    this.scrollTo(sectionId);
  }

  private scrollTo(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  openComposer(): void {
    this.campaign = { subject: '', senderEmail: this.campaign.senderEmail, htmlContent: '' };
    this.responseMessage = '';
    this.showComposer = true;
    this.scrollTo('sec-composer');
  }

  useTemplate(t: EmailTemplate): void {
    this.campaign.subject = t.subject;
    this.campaign.htmlContent = t.html;
    this.responseMessage = '';
    this.showComposer = true;
    this.scrollTo('sec-composer');
  }

  reviewPending(): void {
    this.statusFilter = 'pending';
    this.onFilterChange();
    this.goTo('audience', 'sec-contacts');
  }

  // ---------- Custom templates (saved in this browser) ----------
  private loadCustomTemplates(): void {
    try {
      const raw = localStorage.getItem(TEMPLATE_KEY);
      this.customTemplates = raw ? JSON.parse(raw) : [];
    } catch {
      this.customTemplates = [];
    }
  }

  saveAsTemplate(): void {
    if (!this.campaign.subject.trim() && !this.campaign.htmlContent.trim()) return;
    const name = prompt('Name this template');
    if (!name || !name.trim()) return;

    this.customTemplates.push({
      name: name.trim(),
      description: 'Saved by you',
      icon: '⭐',
      color: 'gray',
      subject: this.campaign.subject,
      html: this.campaign.htmlContent
    });
    try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(this.customTemplates)); } catch {}
  }

  // ---------- Loading ----------
  loadSubscribers(): void {
    this.http.get<Subscriber[]>(`${this.api}/subscribers`).subscribe({
      next: data => this.subscribers = data,
      error: err => console.error('Could not load subscribers', err)
    });
  }

  loadCampaigns(): void {
    this.http.get<Campaign[]>(`${this.api}/campaigns`).subscribe({
      next: data => this.campaigns = data,
      error: err => console.error('Could not load campaigns', err)
    });
  }

  // ---------- Contacts table: search, filter, paging ----------
  get filteredContacts(): Subscriber[] {
    const q = this.search.trim().toLowerCase();
    return this.subscribers.filter(s =>
      (this.statusFilter === 'all' || s.status === this.statusFilter) &&
      (this.tagFilter === 'all' || s.tag === this.tagFilter) &&
      (!q || s.email.toLowerCase().includes(q)));
  }

  get pagedContacts(): Subscriber[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredContacts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredContacts.length / this.pageSize));
  }

  get rangeStart(): number {
    return this.filteredContacts.length ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.pageSize, this.filteredContacts.length);
  }

  onFilterChange(): void { this.page = 1; }
  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  // ---------- Add / import / activate / delete ----------
  addSubscriber(): void {
    if (!this.newEmail.trim()) return;
    this.http.post(`${this.api}/subscribers`, {
      email: this.newEmail,
      consent: String(this.consentConfirmed),
      tag: this.importTag
    }).subscribe({
      next: () => {
        this.showSubscriberMessage('Email added.', true);
        this.newEmail = '';
        this.loadSubscribers();
      },
      error: err => this.showSubscriberMessage(
        typeof err.error === 'string' ? err.error : 'Could not add email.', false)
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (file) this.handleFile(file);
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.csvPreview = null;
    const reader = new FileReader();
    reader.onload = () => this.csvPreview = this.buildPreview(file.name, String(reader.result));
    reader.readAsText(file);
  }

  private buildPreview(fileName: string, text: string): CsvPreview {
    const existing = new Set(this.subscribers.map(s => s.email.toLowerCase()));
    const seen = new Set<string>();
    let valid = 0, duplicates = 0, invalid = 0;

    for (const line of text.split(/\r?\n/)) {
      let candidate: string | null = null;
      for (const cell of line.split(/[,;\t]/)) {
        const c = this.clean(cell);
        if (c.includes('@')) { candidate = c; break; }
      }
      if (!candidate) continue;
      if (!EMAIL.test(candidate)) { invalid++; continue; }
      if (seen.has(candidate) || existing.has(candidate)) { duplicates++; continue; }
      seen.add(candidate);
      valid++;
    }
    return { fileName, valid, duplicates, invalid };
  }

  private clean(s: string): string {
    return s.trim().replace(/["']/g, '').toLowerCase();
  }

  importCsv(): void {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('consent', String(this.consentConfirmed));
    if (this.importTag.trim()) formData.append('tag', this.importTag.trim());

    this.http.post<{ added: number; duplicates: number; invalid: number; status: string }>(
      `${this.api}/subscribers/import`, formData).subscribe({
      next: r => {
        this.showSubscriberMessage(
          `${r.added} added as ${r.status}, ${r.duplicates} duplicates skipped, ${r.invalid} invalid.`, true);
        this.selectedFile = null;
        this.csvPreview = null;
        this.loadSubscribers();
      },
      error: () => this.showSubscriberMessage('CSV import failed. Check backend logs.', false)
    });
  }

  activateSubscriber(id: number): void {
    this.http.put(`${this.api}/subscribers/${id}/activate`, {}).subscribe({
      next: () => this.loadSubscribers(),
      error: err => console.error(err)
    });
  }

  deleteSubscriber(id: number): void {
    if (!confirm('Remove this email?')) return;
    this.http.delete(`${this.api}/subscribers/${id}`).subscribe({
      next: () => this.loadSubscribers(),
      error: err => console.error(err)
    });
  }

  // ---------- Sending ----------
  onSendCampaign(): void {
    if (!confirm(`This will send to ${this.activeCount} active contacts. Send now?`)) return;

    this.isSending = true;
    this.responseMessage = '';

    this.http.post(`${this.api}/campaigns/send`, this.campaign, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.isSending = false;
        this.isSuccess = true;
        this.responseMessage = response;
        this.campaign = { subject: '', senderEmail: this.campaign.senderEmail, htmlContent: '' };
        this.loadCampaigns();
      },
      error: (error) => {
        this.isSending = false;
        this.isSuccess = false;
        this.responseMessage = typeof error.error === 'string' && error.error
          ? error.error
          : 'Failed to send campaign. Check backend logs.';
        console.error(error);
      }
    });
  }

  private showSubscriberMessage(msg: string, success: boolean): void {
    this.subscriberMessage = msg;
    this.subscriberSuccess = success;
  }
}