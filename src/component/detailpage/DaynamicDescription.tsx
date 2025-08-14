import React from 'react';

interface DynamicDescriptionProps {
  description?: string;
  htmlDescription?: string;
  className?: string;
}

export const DynamicDescription: React.FC<DynamicDescriptionProps> = ({
  description,
  htmlDescription,
  className = '',
}) => {
  // Check if we have HTML description and if it contains actual HTML tags
  const hasHtmlContent = htmlDescription && /<[^>]*>/g.test(htmlDescription);

  // If we have HTML content, render it with full styling
  if (hasHtmlContent) {
    return (
      <div className={`dynamic-description html-content ${className}`}>
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: htmlDescription }} />
      </div>
    );
  }

  // Otherwise, render plain text with enhanced formatting
  const plainTextDescription = description || htmlDescription || 'No description available.';

  // Split into paragraphs and format
  const paragraphs = plainTextDescription.split('\n\n').filter((p) => p.trim());

  return (
    <div className={`dynamic-description plain-text ${className}`}>
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((paragraph, index) => {
          // Check if paragraph looks like a list item
          if (paragraph.includes('•') || paragraph.includes('-') || paragraph.includes('*')) {
            const listItems = paragraph.split(/[•\-*]/).filter((item) => item.trim());
            return (
              <ul key={index} className="enhanced-list">
                {listItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="enhanced-list-item">
                    {item.trim()}
                  </li>
                ))}
              </ul>
            );
          }

          // Check if paragraph looks like a heading (ALL CAPS or starts with numbers)
          if (paragraph.toUpperCase() === paragraph && paragraph.length < 100) {
            return (
              <h3 key={index} className="enhanced-heading">
                {paragraph}
              </h3>
            );
          }

          // Check if paragraph contains key-value pairs (contains colons)
          if (paragraph.includes(':') && paragraph.split(':').length === 2) {
            const [key, value] = paragraph.split(':');
            return (
              <div key={index} className="enhanced-key-value">
                <span className="key">{key.trim()}:</span>
                <span className="value">{value.trim()}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={index} className="enhanced-paragraph">
              {paragraph}
            </p>
          );
        })}
      </div>
    </div>
  );
};