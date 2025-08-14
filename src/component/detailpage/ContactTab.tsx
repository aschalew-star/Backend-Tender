import React from 'react';
import { MessageCircle, Users, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Botton';
import {type SystemUser } from '../type/Tender';

interface ContactTabProps {
  postedBy?: SystemUser;
}

export const ContactTab: React.FC<ContactTabProps> = ({ postedBy }) => (
  <Card className="bg-white/95 backdrop-blur-md border-indigo-100">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        Contact Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {postedBy ? (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {postedBy.firstName} {postedBy.lastName}
                  </p>
                  <p className="text-gray-600 text-sm">{postedBy.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href={`mailto:${postedBy.email}`} className="text-indigo-600 hover:text-indigo-700">
                    {postedBy.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  {postedBy.phoneNo ? (
                    <a href={`tel:${postedBy.phoneNo}`} className="text-indigo-600 hover:text-indigo-700">
                      {postedBy.phoneNo}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contact information available.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-4">Quick Inquiry</h4>
          <Button className="w-full mb-3" disabled={!postedBy}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={!postedBy}>
            <Phone className="w-4 h-4 mr-2" />
            Schedule Call
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);