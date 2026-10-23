import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const h = inject(AuthService).authHeader;
  return h ? next(req.clone({ setHeaders: { Authorization: h } })) : next(req);
};