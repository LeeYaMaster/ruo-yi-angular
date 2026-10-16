import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Config } from '../../../http/config';

@Component({
  selector: 'app-swagger',
  imports: [CommonModule],
  templateUrl: './swagger.html',
  styleUrl: './swagger.less',
})
export class Swagger {
  url: SafeResourceUrl;
  constructor(sanitizer: DomSanitizer) {
    // Nest: /swagger-ui/ （dev-api 代理到 8080）
    this.url = sanitizer.bypassSecurityTrustResourceUrl(Config.API_URL + 'swagger-ui/');
  }
}
