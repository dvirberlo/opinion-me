import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Opinion Me';
  constructor(private firestoreService: FirestoreService) {}
  ngOnInit(): void {
    this.firestoreService.makeClientUpdated();
  }
}
