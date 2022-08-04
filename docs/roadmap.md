# Roadmap

This list is not ordered by priority nor importance.

## Features

- more authentication options
  - microsoft
  - github
- add more tags to the list
- add swipe gesture actions
  - dismiss notification

### Maybe?

- add category field to posts
- personal feed based on tags (frequent visited tags)

## Technical tasks

- use Observable<> where it can fit
- more and better tests
  - DB
  - UI
  - E2E
- separate firebase-admin enabled server for post and replies filtering
- move route to settings on register from userService to app component
- verifyCreated in userSerive should use something like FireCache.CacheFirst

### Maybe?

- all DB operations should be done offline and then synced to server once per X minutes
  - (very efficient in operations like voting, reaction, etc)
- multi-region DB
- on DB side limit number of queries per user per second
- DB search for users and posts
- copy only used classes from bootstrap to app assets
