import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { paths } from '../../constants/paths';

@Component({
  selector: 'app-buttom-panel',
  templateUrl: './buttom-panel.component.html',
  styleUrls: ['./buttom-panel.component.css'],
})
export class ButtomPanelComponent implements OnInit {
  public paths = paths;
  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {}
}
