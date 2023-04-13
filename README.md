# AmaKrushAI 

## About AKAI :farmer:

The vision of the AI assistant is to empower farmers with the timely knowledge and insights they need to thrive in an ever-changing agricultural landscape. Providing personalised and vernacular assistance through the AI-powered assistant aims to help farmers make informed decisions, increase their crop yields, and ultimately contribute to the increase in farmer income.


## Features :dart:

- **Ama Krushi** (advisory dep of Odisha) maintains a vetted advisory database on key agriculture and allied sector activities relevant to Odisha 
- Information in the curated Database is encoded using BERT to compute the similarity of information  to any query
- Each query passes through an algorithm that scans the DB for relevant information using the similarity score
- A threshold for the similarity score is defined which determines if the DB has information relevant to the prompt
- If the similarity index <  threshold, then GPT3 directly responds to the  query (based on its global learning)
- If the similarity index >  threshold, then GPT3 fine-tunes its response based on the information learnt from the DB
- **Bhashini** is being used to translate queries and responses from Odia to English and vice versa
- Farmers can ask questions in multiple Indian languages (Odia, Hindi, Punjabi, English) 
- Bhashini will detect the language and will provide the response in the input language used 
- The user interface will allow users to toggle between the most commonly used languages (English & Odia) 


## Requirements :scroll:

[NodeJS](https://nodejs.org/en/download/) and NPM or [yarn](https://yarnpkg.com/getting-started/install)


## What's inside?

This repo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `ui`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This repo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
yarn run dev
```

## Designs
![merge_from_ofoct](https://user-images.githubusercontent.com/65057795/231498806-b6b81917-673a-486a-9c80-88901805b4ec.jpg)



## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
