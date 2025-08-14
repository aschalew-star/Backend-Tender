import type{ Tender, TenderDoc } from './type/Tender';

export const mockTenderDocs: TenderDoc[] = [
  {
    id: 1,
    name: 'Technical_Specifications.pdf',
    title: 'Technical Specifications',
    file: '/docs/tech_specs.pdf',
    price: 25.0,
    type: 'PAID',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    tenderId: 1,
  },
  {
    id: 2,
    name: 'Bidding_Guidelines.pdf',
    title: 'Bidding Guidelines',
    file: '/docs/bidding_guide.pdf',
    price: undefined,
    type: 'FREE',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    tenderId: 1,
  },
  {
    id: 3,
    name: 'Project_Requirements.docx',
    title: 'Project Requirements',
    file: '/docs/requirements.docx',
    price: 15.0,
    type: 'PAID',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    tenderId: 1,
  },
];

export const mockHtmlDescription = `
  <div class="tender-description">
    <div class="overview-section">
      <h3 class="section-title">🏗️ Project Overview</h3>
      <p class="highlight-text">This is a <strong>major infrastructure development project</strong> involving the construction of a state-of-the-art highway bridge spanning <em>2.5 kilometers</em> between two major metropolitan areas.</p>
    </div>
    
    <div class="key-features">
      <h3 class="section-title">✨ Key Project Features</h3>
      <ul class="feature-list">
        <li><span class="feature-icon">🌉</span> <strong>Span:</strong> 2.5 kilometers of advanced bridge construction</li>
        <li><span class="feature-icon">🏗️</span> <strong>Foundation:</strong> Deep foundation work with pile driving systems</li>
        <li><span class="feature-icon">🔧</span> <strong>Engineering:</strong> Advanced structural engineering with seismic resistance</li>
        <li><span class="feature-icon">🛡️</span> <strong>Materials:</strong> High-grade steel and reinforced concrete structures</li>
        <li><span class="feature-icon">🚦</span> <strong>Traffic:</strong> 6-lane capacity with emergency lanes</li>
      </ul>
    </div>

    <div class="requirements-section">
      <h3 class="section-title">📋 Technical Requirements</h3>
      <div class="requirements-grid">
        <div class="requirement-card">
          <h4>🏆 Experience Required</h4>
          <p>Minimum 10 years in large-scale infrastructure projects with bridges over 1km in length</p>
        </div>
        <div class="requirement-card">
          <h4>🛡️ Safety Standards</h4>
          <p>Full compliance with international safety standards including ISO 45001 and local regulations</p>
        </div>
        <div class="requirement-card">
          <h4>💰 Financial Capacity</h4>
          <p>Demonstrated financial capacity of minimum $50M with bank guarantees</p>
        </div>
        <div class="requirement-card">
          <h4>⚡ Timeline</h4>
          <p>Project completion within 36 months from contract signing</p>
        </div>
      </div>
    </div>
  </div>
`;

export const mockTenders: Tender[] = [
  {
    id: 1,
    title: 'Construction of Highway Bridge Phase 2',
    description: `This is a major infrastructure development project involving the construction of a state-of-the-art highway bridge spanning 2.5 kilometers between two major metropolitan areas.

KEY PROJECT FEATURES:
• Span: 2.5 kilometers of advanced bridge construction
• Foundation: Deep foundation work with pile driving systems  
• Engineering: Advanced structural engineering with seismic resistance
• Materials: High-grade steel and reinforced concrete structures
• Traffic: 6-lane capacity with emergency lanes

TECHNICAL REQUIREMENTS:
Experience Required: Minimum 10 years in large-scale infrastructure projects
Safety Standards: Full compliance with international safety standards
Financial Capacity: Demonstrated financial capacity of minimum $50M
Timeline: Project completion within 36 months

ENVIRONMENTAL CONSIDERATIONS:
This project emphasizes sustainable construction practices and minimal environmental impact. All contractors must demonstrate environmental compliance and waste reduction programs.

Contact Information:
Project Manager: Sarah Johnson
Email: s.johnson@infrastructure.gov
Phone: +1 (555) 123-4567`,
    biddingOpen: new Date('2024-01-15T09:00:00Z'),
    biddingClosed: new Date('2024-03-15T17:00:00Z'),
    categoryId: 1,
    category: { id: 1, name: 'Construction', createdAt: new Date(), createdBy: 1 },
    subcategoryId: 1,
    subcategory: { id: 1, name: 'Infrastructure', createdBy: 1, createdAt: new Date(), categoryId: 1 },
    regionId: 1,
    region: { id: 1, name: 'Northern Region', createdAt: new Date() },
    postedById: 1,
    postedBy: {
      id: 1,
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@system.com',
      phoneNo: '+1 (555) 123-4567',
      role: 'ADMIN',
      password: 'hashed_password',
      type: 'systemuser',
      createdAt: new Date(),
    },
    approvedById: 1,
    approvedBy: {
      id: 1,
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@system.com',
      phoneNo: '+1 (555) 123-4567',
      role: 'ADMIN',
      password: 'hashed_password',
      type: 'systemuser',
      createdAt: new Date(),
    },
    approvedAt: new Date('2024-01-10T10:00:00Z'),
    type: 'PAID',
    tenderDocs: mockTenderDocs,
    biddingDocs: [],
  },
];