import { Component, AfterViewInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_afghanistanLow from '@amcharts/amcharts4-geodata/afghanistanLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { COLOR_1, COLOR_2, COLOR_3, COLOR_4 } from '@app/configs/chart.config';
import { RegionData } from '../../dashboard.type';

const colors = [COLOR_1, COLOR_2, COLOR_3, COLOR_4]

@Component({
    selector: 'region-data',
    templateUrl: './region-data.component.html',
    host: {
        '[class.card]': 'true'
    }
})
export class RegionDataComponent implements AfterViewInit {

    private map: am4maps.MapChart;

    @Input() mapData: RegionData[]

    @ViewChild('region-data-chart', {static: true}) chart: ChartComponent;

    constructor() { }

    initMap() {
        if (!this.mapData) {
            return;
        }

        am4core.useTheme(am4themes_animated);
        let chart = am4core.create('region-data-map', am4maps.MapChart);

        chart.geodata = am4geodata_afghanistanLow;
        chart.projection = new am4maps.projections.Miller();

        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.useGeodata = true;
        let polygonTemplate = polygonSeries.mapPolygons.template;

        polygonTemplate.tooltipText = '{name}: {value}';
        polygonTemplate.nonScalingStroke = true;
        polygonTemplate.strokeWidth = 2;
        polygonTemplate.stroke = am4core.color('#bfd4e0');
        polygonTemplate.propertyFields.fill = 'fill';
        polygonTemplate.fill = am4core.color('#fff');

        if (this.mapData) {
            this.mapData = this.mapData.map((elm, i) => {
                elm.fill = am4core.color(colors[i % colors.length]);  
                return elm;
            });
            polygonSeries.data = [...this.mapData];
        }

        this.map = chart;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['mapData']) {
            this.initMap();
        }
    }

    ngAfterViewInit() {
        this.initMap();
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.dispose();
        }
    }
}
