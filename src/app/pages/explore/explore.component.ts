import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { paths } from 'src/app/constants/paths';
import { TagsList } from 'src/app/models/tags';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit {
  public filterdTags = TagsList;
  public paths = paths;

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  constructor() {}
  ngOnInit(): void {}

  public searchChanged = (): void => {
    const search: string =
      this.searchInput?.nativeElement.value.toLowerCase() || '';
    if (search.length > 0) {
      this.filterdTags = TagsList.filter((tag) => tag.includes(search));
    } else this.filterdTags = TagsList;
  };
}
