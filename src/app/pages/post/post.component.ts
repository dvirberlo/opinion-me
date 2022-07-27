import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Doc } from 'src/app/models/firestore';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  public id: string = '';
  public post?: Doc<Post>;
  public isLoaded: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      this.loadPost();
    });
  }

  private loadPost = () => {
    this.postsService.getPost(this.id).then((post) => {
      this.post = new Doc<Post>(this.id, post);
      this.isLoaded = true;
    });
  };
}
