import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import Pusher from 'pusher-js';


@Component({
    selector: 'profile-notification',
    templateUrl: 'notification.component.html'
})

export class NotificationComponent implements OnInit {

    public notificationList: any[] = [];


    @Output() openMobilePanel = new EventEmitter();

    notificationModel = {
        'Product': [
            {
                icon: 'icon-message-circle',
                title: 'Comments',
                description: 'Receive a notifications when someone is comment on your post.',
                value: true
            },
            {
                icon: 'icon-mail',
                title: 'Email',
                description: 'Receive daily email notifications.',
                value: true
            },
            {
                icon: 'icon-star',
                title: 'Item review',
                description: 'Receive email when someone rate your product.',
                value: false
            },
            {
                icon: 'icon-user-plus',
                title: 'Follows',
                description: 'Receive a notifications when someone follow you.',
                value: false
            }
        ],
        'Promo': [
            {
                icon: 'icon-box',
                title: 'New product',
                description: 'Receive a notifications when a new product arrived.',
                value: false
                
            },
            {
                icon: 'icon-tag',
                title: 'Product discount',
                description: 'Receive a notifications when product discount.',
                value: true
                
            }
        ]
    }
    

    constructor() { }

    ngOnInit() {

     
     }

    onMobilePanelOpen() {
        this.openMobilePanel.emit()
    }
}