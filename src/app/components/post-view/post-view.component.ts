import { Component, Input, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MAX_POST_PREVIEW_LENGTH } from 'src/app/constants/post';
import { RELPY_DIALOG_CONFIG } from 'src/app/constants/reply';
import { Doc } from 'src/app/models/firestore';
import {
  Post,
  Reaction,
  ReactionsGetReactionCount,
  ReactionsHasAllReactions,
  ReactionsHasReacted,
  ReactionsHasReactions,
  ReactionsList,
  ReactionsToggleReaction,
} from 'src/app/models/post';
import { Reply, ReplyNow } from 'src/app/models/replies';
import { CursorReader } from 'src/app/services/firestore-tools';
import { PostsService } from 'src/app/services/posts.service';
import { RepliesService } from 'src/app/services/replies.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { paths } from '../../constants/paths';
import { ReplyDialogComponent } from '../reply-dialog/reply-dialog.component';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css'],
})
export class PostViewComponent implements OnInit {
  @Input() public post?: Doc<Post>;
  @Input() public previewMode: boolean = false;

  public paths = paths;
  public ReactionList = ReactionsList;
  public ReactionsHasAllReactions = ReactionsHasAllReactions;
  public ReactionsHasReactions = ReactionsHasReactions;
  public ReactionsGetReactionCount = ReactionsGetReactionCount;
  public tagsList: string[] = [];

  public repliesReader?: CursorReader<Reply>;

  constructor(
    private repliesService: RepliesService,
    private userService: UserService,
    private postsService: PostsService,
    private snackbarService: SnackbarService,
    public matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.post == undefined) return;
    this.tagsList = Object.keys(this.post.data.tags);
    this.repliesReader = this.repliesService.getRepliesReader(this.post.id);
  }

  public previewContent = (): string => {
    if (this.post === undefined) return '';
    if (this.post.data.content.length <= MAX_POST_PREVIEW_LENGTH)
      return this.post.data.content;
    return this.post.data.content.substring(0, MAX_POST_PREVIEW_LENGTH) + '...';
  };

  public reply = () => {
    if (this.userService.user === undefined)
      return this.snackbarService.pleaseLogin();
    const dialogRef = this.matDialog.open(
      ReplyDialogComponent,
      RELPY_DIALOG_CONFIG
    );
    dialogRef.afterClosed().subscribe(this.replyDialogResult);
  };

  public replyDialogResult = (result?: string) => {
    if (
      this.userService.user === undefined ||
      this.userService.author === undefined ||
      this.post === undefined ||
      result === undefined
    )
      return;
    const reaply = ReplyNow(this.userService.author, result);
    this.repliesService
      .addReply(structuredClone(reaply), this.post.id)
      .then((reference: DocumentReference<Reply>) => {
        this.repliesReader?.addedToTop(new Doc<Reply>(reference.id, reaply));
      })
      .catch(this.snackbarService.errorTryAgain);
  };

  public getReactionIcon = (reaction: Reaction): string => {
    switch (reaction) {
      case Reaction.like:
        return 'recommend';
      case Reaction.dislike:
        return 'thumb_down';
      case Reaction.love:
        return 'favorite';
      case Reaction.haha:
        return 'celebration';
      case Reaction.wow:
        return 'local_fire_department';
      case Reaction.angry:
        return 'sentiment_extremely_dissatisfied';
    }
  };

  public reactToggle = (reaction: Reaction) => {
    if (typeof this.userService.author?.uid !== 'string')
      return this.snackbarService.pleaseLogin();
    if (this.post === undefined) return;
    ReactionsToggleReaction(
      this.post.data.reactions,
      reaction,
      this.userService.author.uid
    );
    this.postsService.reactionUpdate(structuredClone(this.post));
  };
  public hasReacted = (reaction: Reaction): boolean => {
    if (
      typeof this.userService.author?.uid !== 'string' ||
      this.post === undefined
    )
      return false;
    return (
      ReactionsHasReacted(
        this.post?.data.reactions,
        reaction,
        this.userService.author.uid
      ) || false
    );
  };
}
