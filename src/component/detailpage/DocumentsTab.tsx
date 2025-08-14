import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Bage';
import { Button } from './Botton';
import {type TenderDoc } from '../type/Tender';

interface DocumentsTabProps {
  documents: TenderDoc[];
  formatDate: (date: Date) => string;
  onDocumentDownload: (doc: TenderDoc) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, formatDate, onDocumentDownload }) => (
  <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-600" />
        Tender Documents
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="
              flex items-center justify-between p-6 
              bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl 
              border border-gray-200 hover:shadow-lg 
              transition-all duration-200 transform hover:scale-[1.02]
            "
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{doc.title}</h4>
                <p className="text-gray-600 mb-1">{doc.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(doc.createdAt)}</span>
                  <Badge variant={doc.type === 'PAID' ? 'default' : 'secondary'}>{doc.type}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {doc.price && <span className="text-lg font-bold text-indigo-600">${doc.price}</span>}
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => onDocumentDownload(doc)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);