import { Injectable } from "@angular/core";
@Injectable({
    providedIn: 'root'
})
export class CaptchaService {
    private uuid: string = '';
    getUuid(): string {
        return this.uuid;
    }
    setUuid(uuid: string): void {
        this.uuid = uuid;
    }
}