import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Attach to <img>, <video>, <iframe>, or <a>.
 * When the resource 403s due to expired presign, emits mediaRefresh(mediaKey).
 * The parent can call AwsMediaService.refreshSignedUrl(key) and Angular binding updates src/href.
 */
@Directive({
  selector: '[appMediaRetry]',
  standalone: true
})
export class MediaRetryDirective {
  @Input() mediaKey!: string;
  @Output() mediaRefresh = new EventEmitter<void>();

  private retried = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('error', ['$event'])
  onError(_ev: Event) {
    if (this.retried || !this.mediaKey) return;
    this.retried = true;
    this.mediaRefresh.emit();
    // After parent refreshes, reset so we can retry again later if needed
    setTimeout(() => (this.retried = false), 2000);
  }
}
