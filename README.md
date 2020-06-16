![](https://github.com/JakubKoralewski/karnaugh/workflows/GitHub%20Pages%20deploy%20from%20master/badge.svg)
![](https://github.com/JakubKoralewski/karnaugh/workflows/test/badge.svg)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/zeit/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install hundreds of unnecessary dependencies using this neatly concise command:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## File structure

```bash
.
├── components # React components
│   ├── input_formula # The text input accepting statements
│   ├── karnaugh_map # Tables, SVG drawing, DNF highlighting
│   └── presentation # Slide component, arrow controls
├── pages # SSG
├── presentation # Powerpoint directory
│   └── slides # Actual slide components
├── project # Actual project algorithms w/ tests
│   └── dnf
│       └── rectangle_fixtures # test cases
└── public # favicons, images, etc.
```

## Deploy as if on GitHub

GitHub has a prefix URL `/karnaugh` which has to be taken into account
when changing the URL and linking static files. This is automatically assumed
unless the `ASSET_PREFIX` environment variable is overwritten.

To see GitHub's output:

```bash
npm run export
```

To see Netlify's output:

```bash
ASSET_PREFIX="" KARNAUGH_PATH="" npm run export
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/zeit/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
