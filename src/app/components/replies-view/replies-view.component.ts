import { Component, Input, OnInit } from '@angular/core';
import { paths } from 'src/app/constants/paths';
import { Doc } from 'src/app/models/firestore';
import { ReplyType, Vote } from 'src/app/models/replies';
import { AuthorType } from 'src/app/models/user';
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
  @Input() cursorReader?: CursorReader<ReplyType>;
  @Input() postId?: string;
  public isLoaded: boolean = false;

  public paths = paths;
  public VoteGetBalance = Vote.getBalance;

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

  public thumbsUp = (reply: Doc<ReplyType>) =>
    this.vote(reply, (reply) =>
      Vote.toggleUpvote(reply.data.votes, this.userService.author?.uid || '')
    );
  public thumbsDown = (reply: Doc<ReplyType>) =>
    this.vote(reply, (reply) =>
      Vote.toggleDownvote(reply.data.votes, this.userService.author?.uid || '')
    );

  private vote = (
    reply: Doc<ReplyType>,
    action: (reply: Doc<ReplyType>) => void
  ) => {
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

  public hasUpvoted(reply: ReplyType): boolean {
    if (this.userService.author?.uid === undefined) return false;
    return Vote.hasUpvoted(reply.votes, this.userService.author.uid || '');
  }
  public hasDownvoted(reply: ReplyType): boolean {
    if (this.userService.author?.uid === undefined) return false;
    return Vote.hasDonwvoted(reply.votes, this.userService.author.uid || '');
  }

  public isSelf(author: AuthorType): boolean {
    return author.uid === this.userService.author?.uid;
  }
}
