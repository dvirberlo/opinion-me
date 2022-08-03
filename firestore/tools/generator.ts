import {
  getRepliesPath,
  POSTS_PATH,
  PROFILES_PATH,
  USERS_PATH,
} from '../../src/app/constants/firestore';
import { Post } from '../../src/app/models/post';
import { Reply } from '../../src/app/models/replies';
import { Author, Profile, User } from '../../src/app/models/user';

type CustomCheckers = {
  get: string;
  list: string;
  create: string;
  update: string;
  delete: string;
};

const getCreateCheckName = (name: string) => `${name}CreateCheck`;
const getUpdateCheckName = (name: string) => `${name}UpdateCheck`;

const generateRuleAndFunctions = <T>(
  model: T,
  name: string,
  path: string,
  customs: CustomCheckers,
  idName?: string,
  ignore: string[] = []
) =>
  generateRuleMatch(name, path, customs, idName) +
  '\n\n' +
  generateCreateCheckFunction(model, name, ignore) +
  '\n\n' +
  generateUpdateCheckFunction(name);

const generateRuleMatch = (
  name: string,
  path: string,
  customs: CustomCheckers,
  idName?: string
) => {
  let rule = '';
  rule += `match /${path}/`;
  if (idName !== undefined) rule += `{${idName}} `;
  rule += `{\n`;

  let method: keyof typeof customs;
  for (method in customs) {
    rule += `  allow ${method}: if `;
    switch (method) {
      case 'create':
        rule += `${getCreateCheckName(name)}(request.resource.data) && \n`;
        break;
      case 'update':
        rule += `${getUpdateCheckName(name)}(request.resource.data) && \n`;
        break;
    }
    rule += '    ' + customs[method];
    rule += `;\n`;
  }
  rule += `}`;
  return rule;
};

const generateCreateCheckFunction = (
  model: any,
  name: string,
  ignore: string[] = []
): string => {
  let func = `function ${getCreateCheckName(name)}(data){\n`;
  func += `  return `;
  for (const check of generateTypeChecks(model)) {
    func += `data.${check.key} is ${check.type} && \n    `;
  }
  func += generateHasOnly(model, ignore);
  func += ';\n}\n';
  return func;
};

const generateUpdateCheckFunction = (name: string): string => {
  let func = `function ${getUpdateCheckName(name)}(data){\n`;
  func += `  return ${getCreateCheckName(name)}(data) && `;
  func += `request.resource.data.diff(resource.data).addedKeys().size() == 0`;
  func += ';\n}\n';
  return func;
};

const generateHasOnly = (
  model: any,
  ignore: string[] = [],
  path: string = ''
): string => {
  let result = `data${path}.keys().hasOnly(${JSON.stringify(
    Object.keys(model)
  )})`;
  for (const key of Object.keys(model)) {
    const child = model[key];
    if (
      typeof child === 'object' &&
      !Array.isArray(child) &&
      !ignore.includes(key)
    )
      result += ' && \n    ' + generateHasOnly(child, ignore, path + '.' + key);
  }
  return result;
};

type TypeCheck = { key: string; type: string };

const generateTypeChecks = (obj: any): TypeCheck[] => {
  let checks: TypeCheck[] = [];
  for (const key of Object.keys(obj)) {
    const type = generateType(obj[key]);
    if (type !== undefined) checks.push({ key, type });
    if (typeof obj[key] == 'object') {
      const childChecks = generateTypeChecks(obj[key]);
      childChecks.map(
        (val: TypeCheck, index: number) =>
          (childChecks[index].key = `${key}.${childChecks[index].key}`)
      );
      checks.push(...childChecks);
    }
  }
  return checks;
};

const generateType = (val: any): string | undefined => {
  if (Array.isArray(val) || val instanceof Set) return 'list';
  switch (typeof val) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'bool';
    case 'object':
      return 'map';
    default:
      return undefined;
  }
};

const requireAll = (...conditions: string[]): string => {
  let result = '(';
  conditions.forEach((cond: string, index: number) => {
    result += cond;
    if (index !== conditions.length - 1) result += ' && ';
  });
  return result + ')';
};

const requireAny = (...conditions: string[]): string => {
  let result = '(';
  conditions.forEach((cond: string, index: number) => {
    result += cond;
    if (index !== conditions.length - 1) result += ' || ';
  });
  return result + ')';
};

const IS_SELF_FUNC: string = 'isSelf';

const ALWAYS_ALLOW = 'true';
const ALWAYS_DENY = 'false';

const selfUidCheck = `${IS_SELF_FUNC}(uid, request.auth)`;

const selfAuthorCheck = `${IS_SELF_FUNC}(request.resource.data.author.uid, request.auth)`;
const selfWasAuthorCheck = `${IS_SELF_FUNC}(resource.data.author.uid, request.auth)`;

const isRecent = (timeFieldPath: string) =>
  `isRecent(request.time, ${timeFieldPath})`;
const recentCreateAt = isRecent('request.resource.data.createAt');
const recentDate = isRecent('request.resource.data.date');

const dummyUser = User.now('asd', 'name', '');

const users = generateRuleAndFunctions(
  dummyUser,
  'users',
  USERS_PATH,
  {
    get: selfUidCheck,
    list: selfUidCheck,
    create: requireAll(selfUidCheck, recentCreateAt),
    update: selfUidCheck,
    delete: selfUidCheck,
  },
  'uid'
);

const postReactionsEmpty = 'postReactionsAreEmpty(request.resource.data)';
const postReactionsUpdated =
  'postReactionsUpdated(resource.data, request.resource.data, request.auth)';

const profiles = generateRuleAndFunctions(
  Profile.fromUser(dummyUser),
  'profiles',
  PROFILES_PATH,
  {
    get: ALWAYS_ALLOW,
    list: ALWAYS_ALLOW,
    create: requireAll(selfUidCheck, recentCreateAt),
    update: selfUidCheck,
    delete: selfUidCheck,
  },
  'uid'
);
const posts = generateRuleAndFunctions(
  Post.now('test', Author.fromUser(dummyUser, '123'), {}, 'ttt'),
  'posts',
  POSTS_PATH,
  {
    get: ALWAYS_ALLOW,
    list: ALWAYS_ALLOW,
    create: requireAll(selfAuthorCheck, recentDate, postReactionsEmpty),
    update: requireAny(selfWasAuthorCheck, postReactionsUpdated),
    delete: selfWasAuthorCheck,
  },
  'postId',
  ['tags']
);

const replyVoted =
  'repliesVoteUpdated(resource.data, request.resource.data, request.auth)';
const replyNotVoted =
  'repliesVoteNotUpdated(resource.data, request.resource.data)';
const replyVoteEmpty = 'repliesVoteIsEmpty(request.resource.data)';
const replies = generateRuleAndFunctions(
  Reply.now(Author.fromUser(dummyUser, '123'), 'ttt'),
  'replies',
  // use {postId} since it is a sub-match of '/posts/{postId}' match
  getRepliesPath('{postId}'),
  {
    get: ALWAYS_ALLOW,
    list: ALWAYS_ALLOW,
    create: requireAll(selfAuthorCheck, recentDate, replyVoteEmpty),
    update:
      'reapliesUpdateCheck(resource.data, request.resource.data, request.auth)',
    delete: selfWasAuthorCheck,
  },
  'replyId'
);
