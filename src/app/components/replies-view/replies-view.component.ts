import { Component, Input, OnInit } from '@angular/core';
import { paths } from 'src/app/constants/paths';
import { Doc } from 'src/app/models/firestore';
import { Author } from 'src/app/models/user';
import {
  Reply,
  VoteGetBalance,
  VoteHasDonwvoted,
  VoteHasUpvoted,
  VoteToggleDownvote,
  VoteToggleUpvote,
} from 'src/app/models/replies';
import { CursorReader } from 'src/app/services/firestore-tools';
import { RepliesService } from 'src/app/services/replies.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-replies-view',
  templateUrl: './replies-view.component.html',
  styleUrls: ['./replies-view.component.css'],
})
export class ReplisViewComponent implements OnInit {
  @Input() cursorReader?: CursorReader<Reply>;
  @Input() postId?: string;
  public isLoaded: boolean = false;

  public paths = paths;
  public VoteGetBalance = VoteGetBalance;

  constructor(
    public userService: UserService,
    private repliesService: RepliesService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadReplies();
  }

  public loadReplies = async () => {
    if (this.cursorReader === undefined || !this.cursorReader.hasMore) return;
    this.cursorReader.read().then(() => {
      this.isLoaded = true;
    });
  };

  public thumbsUp = (reply: Doc<Reply>) =>
    this.vote(reply, (reply) =>
      VoteToggleUpvote(reply.data.votes, this.userService.author?.uid || '')
    );
  public thumbsDown = (reply: Doc<Reply>) =>
    this.vote(reply, (reply) =>
      VoteToggleDownvote(reply.data.votes, this.userService.author?.uid || '')
    );

  private vote = (reply: Doc<Reply>, action: (reply: Doc<Reply>) => void) => {
    if (
      this.userService.author === undefined ||
      this.userService.author?.uid === null ||
      this.postId === undefined
    )
      return this.snackbarService.pleaseLogin();
    action(reply);
    this.repliesService.voteUpdated(reply, this.postId).catch((err: Error) => {
      this.snackbarService.errorTryAgain();
      console.error(err);
    });
  };

  public hasUpvoted(reply: Reply): boolean {
    if (this.userService.author?.uid === undefined) return false;
    return VoteHasUpvoted(reply.votes, this.userService.author.uid || '');
  }
  public hasDownvoted(reply: Reply): boolean {
    if (this.userService.author?.uid === undefined) return false;
    return VoteHasDonwvoted(reply.votes, this.userService.author.uid || '');
  }

  public isSelf(author: Author): boolean {
    return author.uid === this.userService.author?.uid;
  }
}
