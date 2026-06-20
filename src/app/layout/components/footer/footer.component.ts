import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AwsMediaService } from '@app/shared/services/aws-media.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    host: {
        '[class.footer]': 'true'
    }
})

export class FooterComponent implements OnInit {
    loading = false;
    constructor(
        private awsService: AwsMediaService
    ) { }
    ngOnInit(): void {
    }
    public downloadApp(event?: Event): void {
        if (event) { event.preventDefault(); }
        this.awsService.getSignedUrl('media/musafir.apk').subscribe({
            next: (response: any) => {
                const signedUrl: string = response
                if (!signedUrl) return;
                // Create a hidden <a> that points directly to the signed URL
                const a = document.createElement('a');
                a.href = signedUrl;
                a.download = 'musafir.apk';   // forces download name
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            error: err => console.error('Signed URL error:', err)
        });
    }
}
