import { Injectable, signal } from '@angular/core';

const ALL_PERMISSION = '*:*:*';
const SUPER_ADMIN = 'admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  permissions = signal<string[]>([]);
  roles = signal<string[]>([]);
  user = signal<any>(null);

  setFromGetInfo(res: any): void {
    this.permissions.set(res?.permissions ?? []);
    this.roles.set(res?.roles ?? []);
    this.user.set(res?.user ?? null);
  }

  clear(): void {
    this.permissions.set([]);
    this.roles.set([]);
    this.user.set(null);
  }

  hasPermi(flags: string | string[] | null | undefined): boolean {
    const need = Array.isArray(flags) ? flags : flags ? [flags] : [];
    if (!need.length) return false;
    const perms = this.permissions();
    return perms.some((p) => p === ALL_PERMISSION || need.includes(p));
  }

  hasPermiOr(flags: string[]): boolean {
    return this.hasPermi(flags);
  }

  hasRole(role: string | string[]): boolean {
    const need = Array.isArray(role) ? role : [role];
    const roles = this.roles();
    return roles.some((r) => r === SUPER_ADMIN || need.includes(r));
  }
}
