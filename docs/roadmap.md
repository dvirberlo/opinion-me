# Roadmap

This list is not ordered by priority nor importance.

## Features

- create custom theme
- more authentication options
  - microsoft
  - github
- add more tags to the list
- create logo

### Maybe?

- add gesture support
- add category field to posts
- personal feed based on tags (frequent visited tags)

## Technical tasks

- create reusable components

  - login component for new-post and settings pages
  - profile picture component

- use Observable<> where it can fit
- more and better tests
  - DB
  - UI
  - E2E
- separate firebase-admin enabled server for post and replies filtering
- search posts by tags
- use transaction for votes and reactions

### Maybe?

- all DB operations should be done offline and then synced to server once per X minutes
  - (very efficient in operations like voting, reaction, etc)
- multi-region DB
- on DB side limit number of queries per user per second
- DB search for users and posts
