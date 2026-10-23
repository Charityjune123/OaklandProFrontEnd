import { Component, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteFormComponent } from './components/quote-form/quote-form';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { MapComponent } from './map/map';
import { AdminPortalComponent } from './admin-portal/admin-portal';
import { WalkthroughsComponent } from './walkthroughs/walkthroughs';
import { EmailMarketingDashboardComponent } from './components/email-marketing-dashboard/email-marketing-dashboard';
import { CustomerDashboardComponent } from './customerdashboard/customerdashboard';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, QuoteFormComponent, AdminDashboardComponent, AdminPortalComponent, MapComponent, WalkthroughsComponent, EmailMarketingDashboardComponent, CustomerDashboardComponent],
  template: `
<!-- Top Navigation Bar -->
    <header class="header">
   <div class="logo-container" (click)="currentView = 'home'">
  <img src="assets/croppedlogo.png" alt="Oakland Pro Cleaning Services logo" class="brand-badge-icon" />
  <div class="brand-text-group">
    <span class="brand-title"></span>
    <span class="brand-subtitle"></span>
    <span class="brand-tagline"></span>
  </div>
</div>
      <nav class="nav-links">
        <button (click)="currentView = 'home'" [class.active]="currentView === 'home'">Get an Instant Quote</button>
      </nav>
    </header>

    <!-- HOME & CONVERSION WIZARD VIEW -->
    <div *ngIf="currentView === 'home'" class="page-fade">
      
     <!-- Hero Section with Visual Element -->
      <section class="hero">
        <div class="hero-container-inner">
          <div class="hero-content">
            <h1>Reliable. Professional. Trusted.</h1>
            <p>Dependable commercial cleaning services for businesses and 
            <br/>
            professional spaces across Metro Detroit & Oakland County. </p>
            <div class="hero-badges">
              <span>Fully Insured</span>
              <span>Meticulous Standard</span>
              <span>Honest & Reliable</span>
            </div>
          </div>
          
          <!-- Hero Visual Showcase Card -->
          <div class="hero-visual-card">
            <div class="visual-badge">Oakland County's Premier Choice</div><br>
            <br><h3>Commercial Cleaners Who Mean Business</h3>
            <p>From medical clinics to corporate offices, we bring a dedication to excellence and consistent, dependable service to every workspace.</p>
            <div class="visual-stats">
              <div><strong></strong> </div>
              <div><strong></strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Section: Form Wizard + Services Overview Grid -->
      <section class="main-content-grid">
        
        <!-- Left Column: Services We Excel At -->
        <div class="services-info-column">
          <h2>Facilities We Specialize In</h2>
          <p class="section-sub"></p>
          
          <div class="service-pill">
            <h3>🏢 Corporate Offices</h3>
            <p>Desk sanitization, common areas, and pristine conference rooms.</p>
          </div>

          <div class="service-pill">
            <h3>🩺 Medical & Dental Clinics</h3>
            <p>Strict hygiene protocols and sanitized waiting/exam areas.</p>
          </div>

          <div class="service-pill">
            <h3>🛍️ Retail Boutiques & Showrooms</h3>
            <p>Spotless glass displays and gleaming high-traffic floors.</p>
          </div>

          <div class="service-pill">
            <h3>✂️ Salons, Spas & Studios</h3>
            <p>Detail-oriented cleaning tailored for high-end aesthetic spaces.</p>
          </div>

          <div class="service-pill">
            <h3>⛪ Churches & Worship Spaces</h3>
            <p>Respectful, thorough sanctuary and fellowship hall maintenance.</p>
          </div>
        </div>

        <!-- Right Column: The Instant Quote Wizard -->
        <div id="quote-wizard-container" class="wizard-column">
          <div class="wizard-header-box">
            <h2>Get Your Instant Estimate</h2>
            <p>Complete the steps below to calculate pricing and schedule your walkthrough.</p>
          </div>
          <app-quote-form></app-quote-form>
        </div>
      </section>
       <div>
            <app-map></app-map>
          </div>
    </div>
     
     <div *ngIf="currentView === 'admin' && !auth.loggedIn()" class="page-fade" style="max-width:360px;margin:80px auto;display:flex;flex-direction:column;gap:12px;">
  <h2>Admin Sign In</h2>
  <input [(ngModel)]="user" placeholder="Username" />
  <input type="password" [(ngModel)]="pass" placeholder="Password" (keyup.enter)="signIn()" />
  <button (click)="signIn()">Sign In</button>
  <p style="color:#b91c1c;margin:0">{{ loginError }}</p>
</div>

<div *ngIf="currentView === 'admin' && auth.loggedIn()" class="page-fade">
  <button (click)="auth.logout()">Log out</button>

  <app-admin-portal
  *ngIf="adminView === 'portal'"
  (openLeads)="adminView = 'leads'"
  (openWalkthroughs)="adminView = 'walkthroughs'"
  (openCampaignManager)="adminView = 'campaigns'"
  (openCustomers)="adminView = 'customers'">
  </app-admin-portal>

  <app-admin-dashboard
    *ngIf="adminView === 'leads'">
  </app-admin-dashboard>

   <app-walkthroughs
    *ngIf="adminView === 'walkthroughs'">
  </app-walkthroughs>

  <app-customerdashboard
    *ngIf="adminView === 'customers'">
  </app-customerdashboard>

   <app-email-marketing-dashboard *ngIf="adminView === 'campaigns'"></app-email-marketing-dashboard>

</div>
    <!-- Footer -->
    <footer class="footer">
      <p>&copy; Oakland Pro Cleaning Services. All Rights Reserved.</p>
    </footer>
  `,
  styles: [`

    :host {
      display: block;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #334155;
      background-color: #f8fafc;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0px 140px;
      background-color: #f8fafc; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      color: white;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 20px;
  margin-left: 0;
   align-items: center;
}


.brand-badge-icon {
  height: 70px;
  width: auto;
  max-width: none;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}

/* Empty text lines take up no space until you type something in them */
.brand-text-group span:empty {
  display: none;
}

/* Space between the logo and any text you add later */
.brand-text-group:has(span:not(:empty)) {
  margin-left: 12px;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-align: center;
}

.brand-title {
  color: #ffffff;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 3px;
}

.brand-subtitle {
  color: rgb(248, 242, 56);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.brand-tagline {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
}
    .nav-links {
      display: flex;
      gap: 12px;
    }
    .nav-links button {
      background: transparent;
      border: 1px solid #475569;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s;
    }
    .nav-links button:hover, .nav-links button.active {
      background-color: #9cb2bc;
      border-color: #b2cad6;
    }
    .nav-links button.admin-btn {
      border: 1px dashed #64748b;
    }
    .hero {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.15) 0%, rgba(30, 41, 59, 0.10) 100%), 
                url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      color: white;
      padding: 50px 20px;
    }

    .hero-container-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 30px;
      align-items: center;
    }
.hero-badges span::before {
  content: "✓";
  color: #1d6fe0; /* your blue */
  font-weight: 700;
  margin-right: 0.5em;
}


    @media (max-width: 900px) {
      .hero-container-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-badges {
        justify-content: center;
      }
    }

    .hero-content {
      transform: translateY(-60px);
    }
    .hero-content h1 {
      font-size: 38px;
      margin-bottom: 26px;
      color: #e68f0de0;
      letter-spacing: -0.5px;
      line-height: 1;
      font-weight: 700;
    }
    .hero-content p {
      font-size: 20px;
      color: #94a3b8;
      margin-bottom: 24px;
      line-height: 1.5;
      transform: translateY(-15px);
    }
    .hero-badges {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 22px;
      color: #e68f0de0;
      font-weight: 400;
      backdrop-filter: blur(30px);
      width: fit-content;
    }

    /* Hero Visual Card on the Right */
    .hero-visual-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 30px;
      border-radius: 12px;
      backdrop-filter: blur(60px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .visual-badge {
      display: inline-block;
      background: #0284c7;
      color: white;
      font-size: 18px;
      font-weight: 700;
      padding: 14px 14px;
      border-radius: 20px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
 
    .hero-visual-card h3 {
      margin: 0 0 10px 0;
      font-size: 17px;
      font-weight: 200;
      color: white;
      text-transform: uppercase;
    }
    .hero-visual-card p {
      margin: 0 0 20px 0;
      color: #cbd5e1;
      font-size: 18px;
      line-height: 1.5;
    }
    .visual-stats {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 16px;
      font-size: 18px;
      color: #94a3b8;
    }
    .visual-stats strong {
      color: #38bdf8;
      font-size: 30px;
      display: block;
    }

    /* Main Grid: Services on left, Wizard on right */
    .main-content-grid {
      max-width: 1200px;
      margin: 40px auto 80px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .main-content-grid {
        grid-template-columns: 1fr;
      }
    }

    .services-info-column h2 {
      font-size: 26px;
      color: #1e293b;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .section-sub {
      color: #64748b;
      font-size: 18px;
      margin-bottom: 24px;
    }

    .service-pill {
      background: white;
      padding: 16px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      margin-bottom: 14px;
      border-left: 4px solid #0284c7;
    }
    .service-pill h3 {
      margin: 0 0 6px 0;
      color: #1e293b;
      font-size: 23px;
    }
    .service-pill p {
      margin: 0;
      color: #64748b;
      font-size: 20px;
      line-height: 1.4;
    }

    .wizard-column {
      background: white;
      border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .wizard-header-box {
      background: #f8fafc;
      padding: 10px 24px;
      border-bottom: 1px solid #e2e8f0;
      text-align: center;
    }
    .wizard-header-box h2 {
      margin: 0 0 6px 0;
      color: #1e293b;
      font-size: 25px;
    }
    .wizard-header-box p {
      margin: 0;
      color: #64748b;
      font-size: 23px;
    }

    /* Footer */
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      text-align: center;
      padding: 24px;
      font-size: 14px;
    }

    .nav-links button { color: #1e293b; }

@media (max-width: 900px) {
  .header { padding: 0 16px; }
  
  /* Frosted box + bright white text color matching the visual card on mobile */
  .hero-content { 
    transform: none; 
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 30px;
    border-radius: 12px;
    backdrop-filter: blur(60px);
    -webkit-backdrop-filter: blur(60px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    margin-bottom: 20px;
  }
  .hero-content p { 
    transform: none; 
    color: #cbd5e1; /* Matches hero-visual-card paragraph color */
  }
}

@media (max-width: 600px) {
  .header { flex-wrap: wrap; justify-content: center; padding: 8px 12px; }
  .logo-container { padding: 8px; }
  .brand-badge-icon { height: 48px; }
  .nav-links { gap: 8px; }
  .nav-links button { padding: 8px 12px; font-size: 13px; }

  .hero { padding: 32px 16px; }
  .hero-content h1 { font-size: 30px; }
  .hero-content p { font-size: 17px; }
  .hero-content p br { display: none; }
  .hero-badges { font-size: 18px; }
  .hero-content, .hero-visual-card { padding: 20px; }
  .hero-visual-card p { font-size: 16px; }

  .service-pill h3 { font-size: 19px; }
  .service-pill p { font-size: 16px; }
  .wizard-header-box h2 { font-size: 21px; }
  .wizard-header-box p { font-size: 16px; }
}

/* inside @media (max-width: 600px) */
.visual-badge { font-size: 14px; padding: 10px 14px; }
.main-content-grid { padding: 0 12px; margin: 24px auto 48px; }
.hero-badges { gap: 8px 14px; }

    .page-fade {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class App {
  currentView: 'home' | 'admin' = window.location.hash === '#admin' ? 'admin' : 'home';
  adminView: 'portal' | 'customers' | 'leads' | 'walkthroughs' | 'campaigns' = 'portal';

  user = '';
  pass = '';
  loginError = '';

  constructor(public auth: AuthService) {}

  @HostListener('window:hashchange')
  onHashChange() {
    this.currentView = window.location.hash === '#admin' ? 'admin' : 'home';
    this.adminView = 'portal';
  }

  clearHash() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  signIn() {
    this.auth.login(this.user, this.pass).subscribe({
      next: () => { this.loginError = ''; this.pass = ''; },
      error: () => (this.loginError = 'Invalid username or password.')
    });
  }
}