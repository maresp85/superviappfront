import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent {

  @Input() title: string;
  @Input() breadcrumbtitle: string;
  @Input() breadcrumbtitle2: string;

  constructor() { }

}
