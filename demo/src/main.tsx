import { MDXProvider } from '@mdx-js/react'
import { createRoot } from 'react-dom/client'
import Content from './Content.mdx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <MDXProvider components={{}}>
    <Content />
  </MDXProvider>
)
