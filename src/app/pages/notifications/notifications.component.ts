import { Component, OnInit } from '@angular/core';
import { paths } from 'src/app/constants/paths';
import { ReplyOnPost } from 'src/app/models/notifications';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  public paths = paths;
  constructor(
    private userService: UserService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (
      this.userService.author === undefined ||
      this.userService.author.uid === null
    )
      return;
  }

  public dismiss = (obj: ReplyOnPost) => {
    if (!this.userService.author?.uid) return;
    this.notificationService.dismiss(obj, this.userService.author.uid);
  };
}
