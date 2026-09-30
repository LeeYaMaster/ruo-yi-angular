import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class JobApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('monitor/job/list', query);
  }

  get(jobId: number | string): Observable<any> {
    return this.http.get('monitor/job/' + jobId);
  }

  add(data: any): Observable<any> {
    return this.http.post('monitor/job', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('monitor/job', data);
  }

  remove(jobId: number | string): Observable<any> {
    return this.http.delete('monitor/job/' + jobId);
  }

  changeStatus(jobId: number, status: string): Observable<any> {
    return this.http.put('monitor/job/changeStatus', { jobId, status });
  }

  run(jobId: number, jobGroup: string): Observable<any> {
    return this.http.put('monitor/job/run', { jobId, jobGroup });
  }
}
