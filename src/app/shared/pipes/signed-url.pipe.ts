// src/app/pipes/signed-url.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { AwsMediaService } from '../services/aws-media.service';

@Pipe({ name: 'signedUrl', standalone: true })
export class SignedUrlPipe implements PipeTransform {
  constructor(private media: AwsMediaService) {}
  transform(key: string): Observable<string> {
    return this.media.getSignedUrl(key);
  }
}