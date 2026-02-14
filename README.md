# @bebeal/rehype-color-chips

Rehype plugin that converts color codes into visual color chips in MDX documents

<img width="901" alt="Image" src="https://github.com/user-attachments/assets/1a70064d-30fb-4fbe-9648-7ecdcb2f5eaa" />

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

<img width="186" alt="Image" src="https://github.com/user-attachments/assets/8f5fe976-6831-47a0-99d4-5a5e1b21205a" />

