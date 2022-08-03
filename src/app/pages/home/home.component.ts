import { Component, OnInit } from '@angular/core';
import { PostType } from 'src/app/models/post';
import { CursorReader } from 'src/app/services/firestore-tools';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public isLoaded: boolean = false;
  public postsReader?: CursorReader<PostType>;

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.postsReader = this.postsService.getPostsReader();
    this.loadMorePosts();
  }

  public loadMorePosts = async () => {
    this.postsReader?.read().then(() => {
      this.isLoaded = true;
    });
  };
}
