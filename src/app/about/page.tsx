import styles from './page.module.css';
import { getLanguageFontClass } from '@/lib/utils';
import connectToDatabase from '@/lib/db';
import Setting from '@/models/Setting';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import WriteMeWidget from '@/components/WriteMeWidget';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  await connectToDatabase();
  const aboutSetting = await Setting.findOne({ key: 'about_content' });
  
  let rawContent = "Xin chào, đây là không gian lưu giữ những tấm bưu thiếp và kỷ niệm của mình. Mình sẽ cập nhật thêm thông tin chi tiết ở đây sau nhé!";
  
  if (aboutSetting) {
    rawContent = aboutSetting.value;
  } else {
    // We could fallback to FS here if we wanted to, but we already have a default.
    // However, during local dev before they edit it, the fallback is nice.
    const fs = require('fs');
    const aboutFilePath = path.join(process.cwd(), 'content', 'about.md');
    if (fs.existsSync(aboutFilePath)) {
      rawContent = fs.readFileSync(aboutFilePath, 'utf8');
    }
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
        <div className={styles.imageContainer}>
          {coverImage ? (
             <div className={styles.image} style={{ backgroundImage: `url(${coverImage})` }}></div>
          ) : (
            <div className={styles.placeholder}>
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
          <WriteMeWidget web3FormsKey={process.env.WEB3FORMS_ACCESS_KEY || ''} />
        </div>
      </div>
    </div>
  );
}
