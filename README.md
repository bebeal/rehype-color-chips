# @bebeal/rehype-color-chips

Rehype plugin that converts color codes into visual color chips in MDX documents

<img width="901" alt="Image" src="https://github.com/user-attachments/assets/cf6a0766-50d1-424e-a1d2-95c551346900" />

## Install

```bash
yarn add @bebeal/rehype-color-chips
```

## Usage

```tsx
import { rehypeColorChips } from '@bebeal/rehype-color-chips'

// In your MDX config
{
  rehypePlugins: [rehypeColorChips]
}
```

## Usage in MDX

```mdx
# Colors

Red: #f00

Green: #0f0

Blue: #00f
```

Turns into:

<img width="199" alt="Image" src="https://github.com/user-attachments/assets/81a096ef-2908-4db5-a14a-060d30ec5c1d" />
