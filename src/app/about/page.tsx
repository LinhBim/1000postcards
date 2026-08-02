import styles from './page.module.css';
import { getLanguageFontClass } from '@/lib/utils';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import WriteMeWidget from '@/components/WriteMeWidget';

export default function AboutPage() {
  const aboutFilePath = path.join(process.cwd(), 'content', 'about.md');
  let rawContent = '';
  if (fs.existsSync(aboutFilePath)) {
    rawContent = fs.readFileSync(aboutFilePath, 'utf8');
  } else {
    rawContent = "Xin chào, đây là không gian lưu giữ những tấm bưu thiếp và kỷ niệm của mình. Mình sẽ cập nhật thêm thông tin chi tiết ở đây sau nhé!";
  }

  // Use language detection for the overall page font fallback
  const fontClass = getLanguageFontClass(rawContent);

  // Extract the first image from content to put in the left pane
  // Wait, if she uploads an image in the RichTextEditor, it will be `![...](url)` or `<img src="url" />`.
  // Let's use regex to find the first image.
  const mdImgMatch = rawContent.match(/!\[.*?\]\((.*?)\)/);
  const htmlImgMatch = rawContent.match(/<img.*?src=["'](.*?)["'].*?>/);
  
  const coverImage = mdImgMatch ? mdImgMatch[1] : (htmlImgMatch ? htmlImgMatch[1] : null);

  // Remove the cover image from the main text content so it doesn't render twice
  let contentWithoutCover = rawContent;
  if (mdImgMatch) contentWithoutCover = contentWithoutCover.replace(mdImgMatch[0], '');
  if (htmlImgMatch) contentWithoutCover = contentWithoutCover.replace(htmlImgMatch[0], '');

  return (
    <div className={`${styles.splitScreen} ${fontClass}`}>
      <div className={styles.leftPane}>
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '40vh' }}>
          {coverImage ? (
             <div style={{ width: '100%', height: '100%', minHeight: '40vh', backgroundImage: `url(${coverImage})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
          ) : (
            <div style={{ 
              width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '1.2rem', fontFamily: 'sans-serif'
            }}>
              [Ảnh giới thiệu bản thân - Tải lên sau]
            </div>
          )}
        </div>
      </div>
      <div className={styles.rightPane}>
        <div className={styles.content}>
          <div className={styles.catStamp}></div>
          <div className={styles.pathLine}></div>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {contentWithoutCover.replace(/&nbsp;/g, ' ')}
          </ReactMarkdown>
          <WriteMeWidget />
        </div>
      </div>
    </div>
  );
}
