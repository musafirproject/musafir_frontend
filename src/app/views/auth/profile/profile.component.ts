import { Component, OnInit } from '@angular/core';

interface PanelMenu {
    title: string,
    icon: string
}

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {

    panelMenu : PanelMenu[] = [
        {
            title: 'Personal',
            icon: 'icon-user'
        },
        
        {
            title: 'Security',
            icon: 'icon-lock'
        },
     
    ]

    currentPanel: string = 'Personal';

    constructor() { }

    ngOnInit(): void { }

    onPanelChange (seletedPanel: string) {
        this.currentPanel = seletedPanel
    }
}
