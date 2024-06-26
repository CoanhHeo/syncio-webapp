import {Component, HostListener} from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { TokenService } from 'src/app/core/services/token.service';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  posts: Post[] = [];
  // new
  pageNumber: number = 0;
  pageSize: number = 10; // set số bài viết cần lấy trên 1 trang
  loading: boolean = false;
  endOfFeed: boolean = false;
  // new

  private newPostCreatedSubscription!: Subscription;
  isLogged: boolean = this.tokenService.isValidToken();

  constructor(
    private postService: PostService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.getPosts();

    // Subscribe to the new post created event to add the new post to the top of the feed.
    this.newPostCreatedSubscription = this.postService.getNewPostCreated().subscribe((post) => {
      if (post) {
        this.posts.push(post);
      }
    });
  }

  ngOnDestroy() {
    this.newPostCreatedSubscription.unsubscribe();
  }

  getPosts() {

    // old
    // this.postService.getPosts().subscribe({
    //   next: (posts) => {
    //     this.posts = posts;
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   },
    // });
    // old

    // new - load 10 posts at a time
    if (this.loading || this.endOfFeed) {
      return;
    }
    this.loading = true;

    this.postService.getPosts(this.pageNumber, this.pageSize).subscribe({
      next: (posts) => {
        if (Array.isArray(posts)) {
          if (posts.length === 0) {
            this.endOfFeed = true;
          } else {
            this.posts.push(...posts);
            this.pageNumber++;
          }
        } else {
          console.error('API response is not an array', posts);
        }
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      },
    });
    // new
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.95) {
      this.getPosts();
    }
  }
}
