import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostType } from 'src/app/models/post';
import { CursorReader } from 'src/app/services/firestore-tools';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
})
export class TagsComponent implements OnInit {
  public id: string = '';
  public isLoaded: boolean = false;
  public postsReader?: CursorReader<PostType>;
  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      this.initalizePostsReader();
    });
  }

  private initalizePostsReader = (): void => {
    if (this.id === '') return;
    this.postsReader = this.postsService.getPostByTagReader(this.id);
    this.loadMorePosts();
  };

  public loadMorePosts = async () => {
    this.postsReader?.read().then(() => {
      this.isLoaded = true;
    });
  };
}
