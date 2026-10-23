import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommercialLead {
  id?: number;
  facilityType: string;
  squareFootage: number;
  cleaningFrequency: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  requestedStartDate?: string;
  walkthroughStatus?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = 'https://oaklandprobackend.onrender.com/api/leads';

  constructor(private http: HttpClient) {}

  submitLead(lead: CommercialLead): Observable<CommercialLead> {
    return this.http.post<CommercialLead>(this.apiUrl, lead);
  }

  getAllLeads(): Observable<CommercialLead[]> {
    return this.http.get<CommercialLead[]>(this.apiUrl);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}