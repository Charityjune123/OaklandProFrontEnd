import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WalkthroughLead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  facilityType: string;
  squareFootage: number;
  cleaningFrequency: string;
  estimatedPriceMin?: number;
  estimatedPriceMax?: number;
  requestedStartDate?: string;
}

export interface Walkthrough {
  id?: number;
  leadId: number;
  scheduledDate?: string;
  status?: string;
  notes?: string;
  lead?: WalkthroughLead;
}

@Injectable({
  providedIn: 'root'
})
export class WalkthroughService {
  private baseUrl = 'https://oaklandprobackend.onrender.com/api/walkthroughs';

  constructor(private http: HttpClient) {}

  getAllWalkthroughs(): Observable<Walkthrough[]> {
    return this.http.get<Walkthrough[]>(this.baseUrl);
  }

  createWalkthrough(walkthrough: Walkthrough): Observable<Walkthrough> {
    return this.http.post<Walkthrough>(this.baseUrl, walkthrough);
  }

  updateWalkthrough(id: number, changes: Partial<Walkthrough>): Observable<Walkthrough> {
    return this.http.put<Walkthrough>(`${this.baseUrl}/${id}`, changes);
  }
}