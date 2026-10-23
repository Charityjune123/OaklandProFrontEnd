import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id?: number;
  leadId?: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt?: string;
}

export interface Contract {
  id?: number;
  customerId: number;
  facilityType: string;
  squareFootage: number;
  frequency: string;
  agreedAmount: number;
  startDate: string;
  nextCleanDate: string;
  lastCleanDate?: string;
  assignedTo?: string;
  status: string;
}

export interface Invoice {
  id?: number;
  contractId: number;
  amount: number;
  dueDate: string;
  status: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'https://oaklandprobackend.onrender.com/api/customers';
  private contractUrl = 'https://oaklandprobackend.onrender.com/api/contracts';
  private invoiceUrl = 'https://oaklandprobackend.onrender.com/api/invoices';

  constructor(private http: HttpClient) {}

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Contracts
  getAllContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.contractUrl);
  }

  getContractsByCustomer(customerId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.contractUrl}/customer/${customerId}`);
  }

  createContract(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(this.contractUrl, contract);
  }

  updateContract(id: number, changes: Partial<Contract>): Observable<Contract> {
    return this.http.put<Contract>(`${this.contractUrl}/${id}`, changes);
  }

  completeContract(id: number): Observable<Contract> {
    return this.http.put<Contract>(`${this.contractUrl}/${id}/complete`, {});
  }

  // Invoices
  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.invoiceUrl);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.invoiceUrl, invoice);
  }
}