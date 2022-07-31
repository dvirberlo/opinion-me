import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { paths } from 'src/app/constants/paths';
import { MAX_POST_LENGTH, MAX_POST_TITLE_LENGTH } from 'src/app/constants/post';
import { Doc } from 'src/app/models/firestore';
import { PostTagsNow } from 'src/app/models/post';
import { Tag, TagsList } from 'src/app/models/tags';
import { User } from 'src/app/models/user';
import { PostsService } from 'src/app/services/posts.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

const enum FORM_FIELDS {
  title = 'title',
  content = 'content',
  tags = 'tags',
}

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css'],
})
export class NewPostComponent implements OnInit {
  public formGroup?: FormGroup;
  public tagsInput: Set<Tag> = new Set<Tag>();
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public filteredTags?: Observable<string[]>;
  private userSub?: Subscription;

  @ViewChild('tagInput') tagInputElement?: ElementRef<HTMLInputElement>;

  get title() {
    return this.formGroup?.get(FORM_FIELDS.title);
  }
  get content() {
    return this.formGroup?.get(FORM_FIELDS.content);
  }

  constructor(
    private postsService: PostsService,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  public MAX_POST_TITLE_LENGTH = MAX_POST_TITLE_LENGTH;
  public MAX_POST_LENGTH = MAX_POST_LENGTH;

  ngOnInit(): void {
    this.userSub = this.userService.$user.subscribe((user) =>
      this.initializeForm(user)
    );
  }

  private initializeForm = (user: Doc<User> | undefined) => {
    if (user === undefined) return;
    this.userSub?.unsubscribe();
    this.formGroup = this.formBuilder.group({
      [FORM_FIELDS.title]: [
        '',
        [
          Validators.required,
          Validators.maxLength(MAX_POST_TITLE_LENGTH),
          Validators.minLength(1),
        ],
      ],
      [FORM_FIELDS.content]: [
        '',
        [
          Validators.required,
          Validators.maxLength(MAX_POST_LENGTH),
          Validators.minLength(1),
        ],
      ],
      [FORM_FIELDS.tags]: [''],
    });
    this.filteredTags = this.formGroup
      ?.get(FORM_FIELDS.tags)
      ?.valueChanges.pipe(
        startWith(null),
        map((tag) => this._filter(tag))
      );
  };

  public send = (): void => {
    if (this.formGroup === undefined) return;
    // if user is not logged in, show 'please login' snackbar
    if (
      this.userService.user === undefined ||
      this.userService.author === undefined
    )
      return this.snackbarService.pleaseLogin();
    if (this.formGroup.invalid) return this.formGroup.markAllAsTouched();

    const newPost = PostTagsNow(
      this.title?.value,
      this.userService.author,
      this.tagsInput,
      this.content?.value
    );
    this.postsService.addPost(newPost).then(() => {
      this.snackbarService.posted();
      this.router.navigate([paths.home]);
    });
  };

  public addTag = (event: MatChipInputEvent): void => {
    const value = (event.value || '').trim();
    // prvent add unlisted or existing tag
    if (!TagsList.includes(value) || this.tagsInput.has(value as Tag)) return;
    if (value) this.tagsInput.add(value as Tag);
    event.chipInput!.clear();
    this.formGroup?.get(FORM_FIELDS.tags)?.setValue(null);
  };
  public remove = (tag: Tag): void => {
    this.tagsInput.delete(tag);
    // trigger re-filter autocomplete:
    this.formGroup
      ?.get(FORM_FIELDS.tags)
      ?.setValue(this.formGroup?.get(FORM_FIELDS.tags)?.value);
  };
  public selected = (event: MatAutocompleteSelectedEvent): void => {
    // prvent add or existing tag
    const value = event.option.viewValue;
    if (TagsList.includes(value) && !this.tagsInput.has(value as Tag))
      this.tagsInput.add(value as Tag);
    if (this.tagInputElement) this.tagInputElement.nativeElement.value = '';
    this.formGroup?.get(FORM_FIELDS.tags)?.setValue(null);
  };
  private _filter = (value: string | null): string[] => {
    // shows all unselected tags when empty
    if (!value)
      return TagsList.filter((tag) => !this.tagsInput.has(tag as Tag));
    return TagsList.filter(
      (tag) =>
        !this.tagsInput.has(tag as Tag) &&
        tag.toLowerCase().includes(value.toLowerCase())
    );
  };
}
