import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'profile-social-connect',
    templateUrl: './social-connect.component.html'
})
export class SocialConnectComponent implements OnInit {

    @Output() openMobilePanel = new EventEmitter();

    socialNetwork = [
        {
            img: 'thumb-1.png',
            title: 'Google',
            description: 'juliob@gmail.com',
            connected: true
        },
        {
            img: 'thumb-2.png',
            title: 'Facebook',
            description: 'Not connected',
            connected: false
        },
        {
            img: 'thumb-3.png',
            title: 'Twitter',
            description: 'Not connected',
            connected: false
        },
        {
            img: 'thumb-4.png',
            title: 'Linkedin',
            description: 'Julio Baker',
            connected: true
        },
        {
            img: 'thumb-5.png',
            title: 'Dribbble ',
            description: 'Not connected',
            connected: false
        }
    ]

    constructor() { }

    ngOnInit(): void { }

    onMobilePanelOpen() {
        this.openMobilePanel.emit()
    }
}
