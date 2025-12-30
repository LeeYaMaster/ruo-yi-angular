import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // localStorage 方法
  get(key: string): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem(key)
      : null;
  }

  set(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  setJSON(key: string, jsonValue: any): void {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue));
    }
  }

  getJSON(key: string): any {
    const value = this.get(key);
    if (value != null) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // sessionStorage 方法
  session = {
    get: (key: string): string | null => {
      return isPlatformBrowser(this.platformId)
        ? sessionStorage.getItem(key)
        : null;
    },

    set: (key: string, value: string): void => {
      if (isPlatformBrowser(this.platformId) && key != null && value != null) {
        sessionStorage.setItem(key, value);
      }
    },

    remove: (key: string): void => {
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.removeItem(key);
      }
    },

    setJSON: (key: string, jsonValue: any): void => {
      if (jsonValue != null) {
        this.session.set(key, JSON.stringify(jsonValue));
      }
    },

    getJSON: (key: string): any => {
      const value = this.session.get(key);
      if (value != null) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  };

  // localCache 别名（兼容Vue项目）
  local = {
    get: (key: string) => this.get(key),
    set: (key: string, value: string) => this.set(key, value),
    remove: (key: string) => this.remove(key),
    setJSON: (key: string, jsonValue: any) => this.setJSON(key, jsonValue),
    getJSON: (key: string) => this.getJSON(key)
  };
}